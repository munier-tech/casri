import { prisma } from "./lib/prisma.js";
console.log("Prisma initialized");
const productCount = await prisma.product.count();
const vendorCount = await prisma.vendor.count();
const userCount = await prisma.user.count();
const saleCount = await prisma.sale.count();

console.log("Total products:", productCount);
console.log("Total vendors:", vendorCount);
console.log("Total users:", userCount);
console.log("Total sales:", saleCount);

if (productCount > 0) {
    const p = await prisma.product.findFirst();
    console.log("Sample product:", p.name);
}
process.exit(0);
