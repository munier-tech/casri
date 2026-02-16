import { prisma } from "../lib/prisma.js";
import dayjs from "dayjs";

export const addPurchase = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const body = req.body || {};

    // Allow both single and multiple purchase entries
    const purchases = Array.isArray(body.purchases) ? body.purchases : [body];

    if (!purchases.length) {
      return res.status(400).json({
        message: "Fadlan soo dir hal ama dhowr iibsasho si loo abuuro.",
      });
    }

    const savedPurchases = [];
    const failedPurchases = [];

    for (const item of purchases) {
      const {
        productName,
        supplierName,
        price,
        quantity,
        additionalPrice = 0,
        substractingPrice = 0,
        description,
        total,
      } = item || {};

      // Validate required fields
      if (!productName || !supplierName || price === undefined || quantity === undefined) {
        failedPurchases.push({
          ...item,
          reason: "Magaca alaabta, qiimaha, tirada, iyo magaca ala-qeybiyaha waa lama huraan.",
        });
        continue;
      }

      const parsedQuantity = parseInt(quantity, 10);
      const parsedPrice = parseFloat(price);
      const parsedTotal = total ? parseFloat(total) : (parsedQuantity * parsedPrice) + (parseFloat(additionalPrice) || 0) - (parseFloat(substractingPrice) || 0);

      try {
        const purchase = await prisma.purchase.create({
          data: {
            productName,
            supplierName,
            price: parsedPrice,
            quantity: parsedQuantity,
            total: parsedTotal,
            description: description || "",
            userId,
            datePurchased: dayjs().toDate(),
          }
        });
        const mappedPurchase = {
          ...purchase,
          amountDue: purchase.amountDue || purchase.total || 0,
          amountPaid: purchase.amountPaid || 0,
          purchaseDate: purchase.datePurchased,
          createdAt: purchase.datePurchased,
          notes: purchase.description || ""
        };

        // Raw SQL fallback for fields missing in client
        await prisma.$executeRaw`UPDATE "Purchase" SET "amountDue" = ${parsedTotal}, "amountPaid" = 0 WHERE id = ${purchase.id}`;
        savedPurchases.push(mappedPurchase);
      } catch (err) {
        failedPurchases.push({ ...item, reason: err.message });
      }
    }

    if (savedPurchases.length === 0) {
      return res.status(400).json({
        message: "Ma jiro wax iibsasho sax ah oo la abuuri karo.",
        failedPurchases,
      });
    }

    res.status(201).json({
      message:
        savedPurchases.length > 1
          ? "Iibsashooyin badan si guul leh ayaa loo diiwaangeliyay."
          : "Iibsashada si guul leh ayaa loo diiwaangeliyay.",
      createdCount: savedPurchases.length,
      failedCount: failedPurchases.length,
      createdPurchases: savedPurchases,
      failedPurchases,
    });
  } catch (error) {
    console.error("Error adding purchases:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getAllPurchases = async (req, res) => {
  try {
    const purchases = await prisma.$queryRaw`
      SELECT * FROM "Purchase" 
      WHERE "userId" = ${req.user.id || req.user._id} 
      ORDER BY "datePurchased" DESC
    `;

    if (!purchases || purchases.length === 0) {
      return res.status(404).json({ message: "No purchases found." });
    }

    const mappedPurchases = purchases.map(p => ({
      ...p,
      amountDue: p.total || 0,
      amountPaid: 0,
      purchaseDate: p.datePurchased,
      createdAt: p.datePurchased,
      notes: p.description || ""
    }));

    res.status(200).json({ message: "Purchases fetched successfully", data: mappedPurchases });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDailyPurchases = async (req, res) => {
  try {
    const startOfDay = dayjs().startOf("day").toDate();
    const endOfDay = dayjs().endOf("day").toDate();

    const purchases = await prisma.$queryRaw`
      SELECT * FROM "Purchase" 
      WHERE "datePurchased" >= ${startOfDay} AND "datePurchased" <= ${endOfDay}
      AND "userId" = ${req.user.id || req.user._id}
    `;

    if (!purchases || purchases.length === 0) {
      return res.status(404).json({ message: "No purchases recorded today." });
    }

    const mappedPurchases = purchases.map(p => ({
      ...p,
      amountDue: p.total || 0,
      amountPaid: 0,
      purchaseDate: p.datePurchased,
      createdAt: p.datePurchased,
      notes: p.description || ""
    }));

    res.status(200).json({ message: "Today's purchases fetched successfully", purchases: mappedPurchases });
  } catch (error) {
    console.error("Error in getDailyPurchases:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updatePurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const { productName, supplierName, price, quantity, description, total, datePurchased } = req.body || {};

    const purchase = await prisma.purchase.findUnique({
      where: { id },
    });

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found." });
    }

    if (purchase.userId !== (req.user.id || req.user._id)) {
      return res.status(403).json({ message: "You are not authorized to update this purchase." });
    }

    const data = {};
    if (supplierName) data.supplierName = supplierName;
    if (description !== undefined) data.description = description;
    if (total !== undefined) data.total = parseFloat(total);
    if (datePurchased) data.datePurchased = dayjs(datePurchased).toDate();
    if (productName) data.productName = productName;
    if (price) data.price = parseFloat(price);
    if (quantity) data.quantity = parseInt(quantity);

    const updated = await prisma.purchase.update({
      where: { id },
      data,
    });

    res.status(200).json({
      message: "Purchase updated successfully.",
      purchase: {
        ...updated,
        amountDue: updated.amountDue || updated.total || 0,
        amountPaid: updated.amountPaid || 0,
        purchaseDate: updated.datePurchased,
        createdAt: updated.datePurchased,
        notes: updated.description || ""
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePurchase = async (req, res) => {
  try {
    const { id } = req.params;

    // Check ownership
    const purchase = await prisma.purchase.findUnique({
      where: { id }
    });

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found." });
    }

    if (purchase.userId !== (req.user.id || req.user._id)) {
      return res.status(403).json({ message: "You are not authorized to delete this purchase." });
    }

    // Prisma transactional delete is better
    await prisma.purchase.delete({ where: { id } });

    res.status(200).json({ message: "Purchase deleted successfully.", purchase });
  } catch (error) {
    console.error("Error in deletePurchase:", error);
    res.status(500).json({ message: error.message });
  }
};
