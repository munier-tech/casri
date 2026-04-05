import { prisma } from "../lib/prisma.js";

const DEFAULT_RECEIPT_SETTINGS = {
  storeName: "CASRI INVENTORY",
  footerMessage: "Thank you for your business!",
  includeItemBarcode: true,
  barcodeWrapper: "*",
  barcodeFontSize: 36,
  showSaleBarcode: true,
};

const ensureReceiptSettingsTable = async () => {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ReceiptSetting" (
      "id" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "storeName" TEXT NOT NULL DEFAULT 'CASRI INVENTORY',
      "footerMessage" TEXT NOT NULL DEFAULT 'Thank you for your business!',
      "includeItemBarcode" BOOLEAN NOT NULL DEFAULT true,
      "barcodeWrapper" TEXT NOT NULL DEFAULT '*',
      "barcodeFontSize" INTEGER NOT NULL DEFAULT 36,
      "showSaleBarcode" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "ReceiptSetting_pkey" PRIMARY KEY ("id")
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "ReceiptSetting_userId_key"
    ON "ReceiptSetting"("userId");
  `);
};

const sanitizeReceiptSettings = (payload = {}) => {
  const next = {};

  if (typeof payload.storeName === "string") {
    next.storeName = payload.storeName.trim() || DEFAULT_RECEIPT_SETTINGS.storeName;
  }
  if (typeof payload.footerMessage === "string") {
    next.footerMessage = payload.footerMessage.trim() || DEFAULT_RECEIPT_SETTINGS.footerMessage;
  }
  if (typeof payload.includeItemBarcode === "boolean") {
    next.includeItemBarcode = payload.includeItemBarcode;
  }
  if (typeof payload.showSaleBarcode === "boolean") {
    next.showSaleBarcode = payload.showSaleBarcode;
  }
  if (typeof payload.barcodeWrapper === "string") {
    const wrapper = payload.barcodeWrapper.trim();
    next.barcodeWrapper = wrapper.length > 2 ? wrapper.slice(0, 2) : (wrapper || DEFAULT_RECEIPT_SETTINGS.barcodeWrapper);
  }
  if (payload.barcodeFontSize !== undefined) {
    const fontSize = Number(payload.barcodeFontSize);
    if (!Number.isNaN(fontSize)) {
      next.barcodeFontSize = Math.min(72, Math.max(18, Math.round(fontSize)));
    }
  }

  return next;
};

export const getReceiptSettings = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    await ensureReceiptSettingsTable();

    const existing = await prisma.$queryRaw`
      SELECT * FROM "ReceiptSetting" WHERE "userId" = ${userId} LIMIT 1
    `;

    if (!existing.length) {
      const id = `rs_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
      await prisma.$executeRaw`
        INSERT INTO "ReceiptSetting"
          ("id","userId","storeName","footerMessage","includeItemBarcode","barcodeWrapper","barcodeFontSize","showSaleBarcode","createdAt","updatedAt")
        VALUES
          (${id}, ${userId}, ${DEFAULT_RECEIPT_SETTINGS.storeName}, ${DEFAULT_RECEIPT_SETTINGS.footerMessage},
           ${DEFAULT_RECEIPT_SETTINGS.includeItemBarcode}, ${DEFAULT_RECEIPT_SETTINGS.barcodeWrapper},
           ${DEFAULT_RECEIPT_SETTINGS.barcodeFontSize}, ${DEFAULT_RECEIPT_SETTINGS.showSaleBarcode},
           NOW(), NOW())
      `;
    }

    const rows = await prisma.$queryRaw`
      SELECT * FROM "ReceiptSetting" WHERE "userId" = ${userId} LIMIT 1
    `;
    const settings = rows[0] || { userId, ...DEFAULT_RECEIPT_SETTINGS };

    return res.status(200).json({ success: true, settings });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const updateReceiptSettings = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    await ensureReceiptSettingsTable();

    const updates = sanitizeReceiptSettings(req.body || {});
    const merged = { ...DEFAULT_RECEIPT_SETTINGS, ...updates };
    const id = `rs_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

    await prisma.$executeRaw`
      INSERT INTO "ReceiptSetting"
        ("id","userId","storeName","footerMessage","includeItemBarcode","barcodeWrapper","barcodeFontSize","showSaleBarcode","createdAt","updatedAt")
      VALUES
        (${id}, ${userId}, ${merged.storeName}, ${merged.footerMessage},
         ${merged.includeItemBarcode}, ${merged.barcodeWrapper}, ${merged.barcodeFontSize},
         ${merged.showSaleBarcode}, NOW(), NOW())
      ON CONFLICT ("userId")
      DO UPDATE SET
        "storeName" = EXCLUDED."storeName",
        "footerMessage" = EXCLUDED."footerMessage",
        "includeItemBarcode" = EXCLUDED."includeItemBarcode",
        "barcodeWrapper" = EXCLUDED."barcodeWrapper",
        "barcodeFontSize" = EXCLUDED."barcodeFontSize",
        "showSaleBarcode" = EXCLUDED."showSaleBarcode",
        "updatedAt" = NOW()
    `;

    const rows = await prisma.$queryRaw`
      SELECT * FROM "ReceiptSetting" WHERE "userId" = ${userId} LIMIT 1
    `;
    const settings = rows[0] || { userId, ...merged };

    return res.status(200).json({
      success: true,
      message: "Receipt settings updated",
      settings,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
