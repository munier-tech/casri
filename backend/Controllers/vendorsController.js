import { prisma } from "../lib/prisma.js";

// Test endpoint to verify API is working
export const testVendorAPI = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Vendor API is working!',
    timestamp: new Date().toISOString(),
    endpoints: {
      createVendor: 'POST /api/vendors',
      getVendors: 'GET /api/vendors',
      getVendor: 'GET /api/vendors/:id',
      updateVendor: 'PUT /api/vendors/:id',
      deleteVendor: 'DELETE /api/vendors/:id',
      createPurchase: 'POST /api/vendors/:vendorId/purchases',
      getPurchases: 'GET /api/vendors/:vendorId/purchases',
      updatePurchase: 'PUT /api/vendors/:vendorId/purchases/:purchaseId',
      deletePurchase: 'DELETE /api/vendors/:vendorId/purchases/:purchaseId'
    }
  });
};

// Create new vendor
export const createVendor = async (req, res) => {
  try {
    const { name, phoneNumber, location } = req.body;

    // Validate required fields
    if (!name || !phoneNumber || !location) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone number, and location are required'
      });
    }

    const vendor = await prisma.vendor.create({
      data: {
        name,
        phoneNumber,
        location
      }
    });

    res.status(201).json({
      success: true,
      data: vendor
    });
  } catch (error) {
    console.error('❌ Error creating vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating vendor',
      error: error.message
    });
  }
};

// Get all vendors
export const getVendors = async (req, res) => {
  try {
    const vendors = await prisma.vendor.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      count: vendors.length,
      data: vendors
    });
  } catch (error) {
    console.error('❌ Error fetching vendors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendors',
      error: error.message
    });
  }
};

// Get single vendor
export const getVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        purchases: {
          include: {
            products: true
          }
        }
      }
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: vendor
    });
  } catch (error) {
    console.error('❌ Error fetching vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor',
      error: error.message
    });
  }
};

// Update vendor
export const updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phoneNumber, location } = req.body;

    const vendor = await prisma.vendor.update({
      where: { id },
      data: {
        name,
        phoneNumber,
        location
      }
    });

    res.status(200).json({
      success: true,
      data: vendor,
      message: 'Vendor updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Vendor not found or update failed',
      error: error.message
    });
  }
};


// Delete vendor
export const deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await prisma.vendor.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: 'Vendor deleted successfully',
      data: vendor
    });
  } catch (error) {
    console.error('❌ Error deleting vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Vendor not found or deletion failed',
      error: error.message
    });
  }
};

// Create purchase for vendor
export const createPurchase = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const {
      products,
      amountDue,
      amountPaid,
      paymentMethod = 'cash',
      notes = ''
    } = req.body;

    // Find vendor
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId }
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Validate required fields
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Products array is required and must not be empty'
      });
    }

    if (amountDue === undefined || amountPaid === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Amount due and amount paid are required'
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Purchase (Singular model based on current client)
      const firstProduct = products[0] || {};
      const purchase = await tx.purchase.create({
        data: {
          productName: firstProduct.productName || "General Purchase",
          supplierName: vendor.name,
          price: parseFloat(firstProduct.unitPrice) || 0,
          quantity: parseInt(firstProduct.quantity) || 1,
          total: products.reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0),
          description: notes || "",
          datePurchased: new Date(),
          user: { connect: { id: req.user.id || req.user._id } },
          vendor: vendor.id ? { connect: { id: vendor.id } } : undefined,
          product: firstProduct.productId ? { connect: { id: firstProduct.productId } } : undefined,
        }
      });

      // Raw SQL fallback to save fields currently missing from the Prisma client
      await tx.$executeRaw`UPDATE "Purchase" SET "amountDue" = ${parseFloat(amountDue) || 0}, "amountPaid" = ${parseFloat(amountPaid) || 0}, "paymentMethod" = ${paymentMethod || "cash"} WHERE id = ${purchase.id}`;

      // 2. Update stock for each product
      for (const item of products) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.quantity }
            }
          });
        } else if (item.productName) {
          const existingProductByName = await tx.product.findFirst({
            where: { name: item.productName }
          });

          if (existingProductByName) {
            await tx.product.update({
              where: { id: existingProductByName.id },
              data: {
                stock: { increment: item.quantity }
              }
            });
          }
        }
      }

      // 3. Update vendor totals (amountDue/amountPaid logic)
      const totalPurchaseAmount = products.reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0);
      const updatedVendor = await tx.vendor.update({
        where: { id: vendor.id },
        data: {
          totalPurchases: { increment: 1 },
          totalAmount: { increment: totalPurchaseAmount },
          balance: { increment: (amountDue - amountPaid) }
        }
      });

      return {
        purchase: {
          ...purchase,
          amountDue: purchase.total,
          amountPaid: 0,
          notes: purchase.description,
          purchaseDate: purchase.datePurchased,
          createdAt: purchase.datePurchased
        },
        vendor: updatedVendor
      };
    });

    res.status(201).json({
      success: true,
      data: result,
      message: 'Purchase created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating purchase:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating purchase',
      error: error.message
    });
  }
};

// Get vendor purchases
export const getVendorPurchases = async (req, res) => {
  try {
    const { vendorId } = req.params;

    // Use queryRaw to fetch columns that might be missing from the Prisma client
    const purchases = await prisma.$queryRaw`
      SELECT * FROM "Purchase" 
      WHERE "vendorId" = ${vendorId} 
      ORDER BY "datePurchased" DESC
    `;

    // Map fields for frontend compatibility
    const mappedPurchases = purchases.map(p => ({
      ...p,
      amountDue: p.amountDue || p.total || 0,
      amountPaid: p.amountPaid || 0,
      notes: p.description || "",
      purchaseDate: p.datePurchased,
      createdAt: p.datePurchased,
      vendorName: p.supplierName // Fallback
    }));

    res.status(200).json({ success: true, data: mappedPurchases });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching purchases', error: error.message });
  }
};

// Update purchase
export const updatePurchase = async (req, res) => {
  try {
    const { vendorId, purchaseId } = req.params;
    const {
      products,
      amountDue,
      amountPaid,
      total,
      paymentMethod,
      notes,
      updateStock = true
    } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Get current purchase
      const oldPurchase = await tx.purchase.findUnique({
        where: { id: purchaseId }
      });

      if (!oldPurchase) throw new Error('Purchase not found');

      // 2. Revert effects
      if (updateStock && oldPurchase.productId) {
        await tx.product.update({
          where: { id: oldPurchase.productId },
          data: { stock: { decrement: oldPurchase.quantity || 0 } }
        });
      }

      const oldBalanceChange = (oldPurchase.amountDue || 0) - (oldPurchase.amountPaid || 0);
      const oldTotal = oldPurchase.total;

      // 3. Process new product info
      let newTotal = total || oldTotal;
      let usedProduct = {
        productName: oldPurchase.productName,
        price: oldPurchase.price,
        quantity: oldPurchase.quantity,
        productId: oldPurchase.productId
      };

      if (products && products.length > 0) {
        const first = products[0];
        usedProduct = {
          productName: first.productName,
          price: first.unitPrice,
          quantity: first.quantity,
          productId: first.productId
        };
        newTotal = products.reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0);
      }

      // Apply new stock effect
      if (updateStock && usedProduct.productId) {
        await tx.product.update({
          where: { id: usedProduct.productId },
          data: { stock: { increment: usedProduct.quantity } }
        });
      }

      // 4. Update Header
      const finalAmountDue = amountDue !== undefined ? amountDue : oldPurchase.amountDue;
      const finalAmountPaid = amountPaid !== undefined ? amountPaid : oldPurchase.amountPaid;
      const newBalanceChange = finalAmountDue - finalAmountPaid;

      const updatedPurchase = await tx.purchase.update({
        where: { id: purchaseId },
        data: {
          productName: usedProduct.productName,
          price: usedProduct.price,
          quantity: usedProduct.quantity,
          product: usedProduct.productId ? { connect: { id: usedProduct.productId } } : { disconnect: true },
          total: newTotal,
          description: notes !== undefined ? notes : oldPurchase.description,
        }
      });

      // Raw SQL fallback to save fields currently missing from the Prisma client
      await tx.$executeRaw`UPDATE "Purchase" SET "amountDue" = ${parseFloat(finalAmountDue) || 0}, "amountPaid" = ${parseFloat(finalAmountPaid) || 0}, "paymentMethod" = ${paymentMethod || oldPurchase.paymentMethod || "cash"} WHERE id = ${purchaseId}`;

      // 5. Update Vendor Totals
      const updatedVendor = await tx.vendor.update({
        where: { id: vendorId },
        data: {
          totalAmount: { increment: (newTotal - oldTotal) },
          balance: { increment: (newBalanceChange - oldBalanceChange) }
        }
      });

      return {
        purchase: {
          ...updatedPurchase,
          amountDue: updatedPurchase.amountDue || updatedPurchase.total || 0,
          amountPaid: updatedPurchase.amountPaid || 0,
          notes: updatedPurchase.description || "",
          purchaseDate: updatedPurchase.datePurchased,
          createdAt: updatedPurchase.datePurchased
        },
        vendor: updatedVendor
      };
    });

    res.status(200).json({
      success: true,
      data: result,
      message: 'Purchase updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating purchase:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating purchase',
      error: error.message
    });
  }
};

// Delete purchase
export const deletePurchase = async (req, res) => {
  try {
    const { vendorId, purchaseId } = req.params;

    const result = await prisma.$transaction(async (tx) => {
      const purchase = await tx.purchase.findUnique({
        where: { id: purchaseId }
      });

      if (!purchase) throw new Error('Purchase not found');

      // 1. Revert stock
      if (purchase.productId) {
        await tx.product.update({
          where: { id: purchase.productId },
          data: { stock: { decrement: purchase.quantity || 0 } }
        });
      }

      // 2. Revert vendor totals
      const balanceChange = (purchase.amountDue || 0) - (purchase.amountPaid || 0);
      const updatedVendor = await tx.vendor.update({
        where: { id: vendorId },
        data: {
          totalPurchases: { decrement: 1 },
          totalAmount: { decrement: purchase.total || 0 },
          balance: { decrement: balanceChange || 0 }
        }
      });

      // 3. Delete header
      await tx.purchase.delete({ where: { id: purchaseId } });

      return { purchase, vendor: updatedVendor };
    });

    res.status(200).json({
      success: true,
      message: 'Purchase deleted successfully',
      data: result
    });
  } catch (error) {
    console.error('❌ Error deleting purchase:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting purchase',
      error: error.message
    });
  }
};