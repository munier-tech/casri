-- Add barcode field to products
ALTER TABLE "Product" ADD COLUMN "barcode" TEXT;

-- Add unique index for product barcode (nullable for legacy records)
CREATE UNIQUE INDEX "Product_barcode_key" ON "Product"("barcode");

-- Add receipt settings table per user
CREATE TABLE "ReceiptSetting" (
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

CREATE UNIQUE INDEX "ReceiptSetting_userId_key" ON "ReceiptSetting"("userId");

ALTER TABLE "ReceiptSetting"
ADD CONSTRAINT "ReceiptSetting_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
