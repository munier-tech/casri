import { prisma } from "../lib/prisma.js";

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
      deletePurchase: 'DELETE /api/vendors/:vendorId/purchases/:purchaseId',
      searchProducts: 'GET /api/products/search?q=term'
    }
  });
};

export const createVendor = async (req, res) => {
  try {
    const { name, phoneNumber, location } = req.body;

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
    console.error('Error creating vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating vendor',
      error: error.message
    });
  }
};

export const getVendors = async (req, res) => {
  try {
    const vendors = await prisma.vendor.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const vendorsWithTotals = await Promise.all(
      vendors.map(async (vendor) => {
        const purchases = await prisma.purchase.findMany({
          where: { vendorId: vendor.id }
        });

        const totalAmount = purchases.reduce((sum, p) => sum + (p.total || 0), 0);
        const totalPaid = purchases.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
        const balance = totalAmount - totalPaid;

        return {
          ...vendor,
          totalAmount,
          totalPaid,
          balance,
          totalPurchases: purchases.length
        };
      })
    );

    res.status(200).json({
      success: true,
      count: vendors.length,
      data: vendorsWithTotals
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendors',
      error: error.message
    });
  }
};

export const getVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        purchases: {
          include: {
            product: true,
            purchaseProducts: {
              include: {
                product: true
              }
            }
          },
          orderBy: { datePurchased: 'desc' }
        }
      }
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    const totalAmount = vendor.purchases.reduce((sum, p) => sum + (p.total || 0), 0);
    const totalPaid = vendor.purchases.reduce((sum, p) => sum + (p.amountPaid || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        ...vendor,
        totalAmount,
        totalPaid,
        balance: totalAmount - totalPaid
      }
    });
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor',
      error: error.message
    });
  }
};

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
    console.error('Error updating vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Vendor not found or update failed',
      error: error.message
    });
  }
};

export const deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.purchase.deleteMany({
      where: { vendorId: id }
    });

    const vendor = await prisma.vendor.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: 'Vendor deleted successfully',
      data: vendor
    });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Vendor not found or deletion failed',
      error: error.message
    });
  }
};

export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { barcode: { contains: q } }
        ]
      },
      take: 20,
      orderBy: { name: 'asc' }
    });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching products',
      error: error.message
    });
  }
};
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

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId }
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Products array is required and must not be empty'
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Calculate total price and total quantity from all products
      const totalPrice = products.reduce((sum, item) => {
        return sum + ((parseFloat(item.unitPrice) || 0) * (parseInt(item.quantity) || 1));
      }, 0);
      
      const totalQuantity = products.reduce((sum, item) => {
        return sum + (parseInt(item.quantity) || 1);
      }, 0);

      const purchase = await tx.purchase.create({
        data: {
          productName: products[0]?.productName || 'Purchase Order',
          supplierName: vendor.name,
          price: totalPrice,
          quantity: totalQuantity,
          total: totalPrice, // Required field - same as price in this case
          amountDue: parseFloat(amountDue) || 0,
          amountPaid: parseFloat(amountPaid) || 0,
          paymentMethod: paymentMethod,
          notes: notes || "",
          datePurchased: new Date(),
          user: {
            connect: { id: req.user?.id || req.user?._id }
          },
          vendor: {
            connect: { id: vendor.id }
          }
        }
      });

      const purchaseProducts = await Promise.all(
        products.map(async (item) => {
          let productId = item.productId;

          if (!productId && item.productName) {
            const existingProduct = await tx.product.findFirst({
              where: { name: item.productName }
            });

            if (existingProduct) {
              productId = existingProduct.id;
            } else {
              const newProduct = await tx.product.create({
                data: {
                  name: item.productName,
                  cost: item.unitPrice || 0,
                  price: item.unitPrice || 0,
                  stock: 0,
                  lowStockThreshold: 5
                }
              });
              productId = newProduct.id;
            }
          }

          if (productId) {
            await tx.product.update({
              where: { id: productId },
              data: {
                stock: { increment: item.quantity || 1 }
              }
            });
          }

          const productTotal =
            (parseFloat(item.unitPrice) || 0) *
            (parseInt(item.quantity) || 1);

          return tx.purchaseProduct.create({
            data: {
              purchase: { connect: { id: purchase.id } },
              product: productId ? { connect: { id: productId } } : undefined,
              productName: item.productName || 'Unknown Product',
              quantity: parseInt(item.quantity) || 1,
              unitPrice: parseFloat(item.unitPrice) || 0,
              total: productTotal
            }
          });
        })
      );

      const totalPurchaseAmount = purchaseProducts.reduce(
        (sum, p) => sum + p.total,
        0
      );

      const updatedVendor = await tx.vendor.update({
        where: { id: vendor.id },
        data: {
          totalPurchases: { increment: 1 },
          totalAmount: { increment: totalPurchaseAmount },
          balance: { increment: (parseFloat(amountDue) || 0) - (parseFloat(amountPaid) || 0) }
        }
      });

      return {
        purchase,
        products: purchaseProducts,
        vendor: updatedVendor
      };
    });

    res.status(201).json({
      success: true,
      data: result,
      message: 'Purchase created successfully'
    });
  } catch (error) {
    console.error('Error creating purchase:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating purchase',
      error: error.message
    });
  }
};

export const getVendorPurchases = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const purchases = await prisma.purchase.findMany({
      where: { vendorId },
      include: {
        vendor: true,
        user: true,
        purchaseProducts: {
          include: {
            product: true
          }
        }
      },
      orderBy: { datePurchased: 'desc' }
    });

    const mappedPurchases = purchases.flatMap(purchase => 
      purchase.purchaseProducts.map(product => ({
        id: purchase.id,
        vendorId: purchase.vendorId,
        vendorName: purchase.supplierName,
        productId: product.productId,
        productName: product.productName,
        product: product.product,
        quantity: product.quantity,
        unitPrice: product.unitPrice,
        total: product.total,
        amountDue: purchase.amountDue || 0,
        amountPaid: purchase.amountPaid || 0,
        paymentMethod: purchase.paymentMethod || 'cash',
        notes: purchase.notes || "",
        purchaseDate: purchase.datePurchased,
        createdAt: purchase.datePurchased,
        updatedAt: purchase.updatedAt
      }))
    );

    res.status(200).json({
      success: true,
      data: mappedPurchases
    });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching purchases',
      error: error.message
    });
  }
};

export const updatePurchase = async (req, res) => {
  try {
    const { vendorId, purchaseId } = req.params;
    const { amountPaid, paymentMethod, notes } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      const oldPurchase = await tx.purchase.findUnique({
        where: { id: purchaseId }
      });

      if (!oldPurchase) throw new Error('Purchase not found');

      const oldBalanceChange =
        (oldPurchase.amountDue || 0) - (oldPurchase.amountPaid || 0);
      const newAmountPaid =
        amountPaid !== undefined ? amountPaid : oldPurchase.amountPaid;
      const newBalanceChange =
        (oldPurchase.amountDue || 0) - newAmountPaid;

      const updatedPurchase = await tx.purchase.update({
        where: { id: purchaseId },
        data: {
          amountPaid: newAmountPaid,
          paymentMethod: paymentMethod || oldPurchase.paymentMethod,
          notes: notes !== undefined ? notes : oldPurchase.notes
        }
      });

      const updatedVendor = await tx.vendor.update({
        where: { id: vendorId },
        data: {
          balance: { increment: newBalanceChange - oldBalanceChange }
        }
      });

      return {
        purchase: updatedPurchase,
        vendor: updatedVendor
      };
    });

    res.status(200).json({
      success: true,
      data: result,
      message: 'Purchase updated successfully'
    });
  } catch (error) {
    console.error('Error updating purchase:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating purchase',
      error: error.message
    });
  }
};

export const deletePurchase = async (req, res) => {
  try {
    const { vendorId, purchaseId } = req.params;

    const result = await prisma.$transaction(async (tx) => {
      const purchase = await tx.purchase.findUnique({
        where: { id: purchaseId },
        include: {
          purchaseProducts: true
        }
      });

      if (!purchase) throw new Error('Purchase not found');

      for (const product of purchase.purchaseProducts) {
        if (product.productId) {
          await tx.product.update({
            where: { id: product.productId },
            data: {
              stock: { decrement: product.quantity || 0 }
            }
          });
        }
      }

      const balanceChange =
        (purchase.amountDue || 0) - (purchase.amountPaid || 0);

      const updatedVendor = await tx.vendor.update({
        where: { id: vendorId },
        data: {
          totalPurchases: { decrement: 1 },
          totalAmount: { decrement: purchase.amountDue || 0 },
          balance: { decrement: balanceChange || 0 }
        }
      });

      await tx.purchase.delete({ where: { id: purchaseId } });

      return { purchase, vendor: updatedVendor };
    });

    res.status(200).json({
      success: true,
      message: 'Purchase deleted successfully',
      data: result
    });
  } catch (error) {
    console.error('Error deleting purchase:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting purchase',
      error: error.message
    });
  }
};