import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const count = await prisma.product.count();
    console.log('Total products in database:', count);
    if (count > 0) {
        const first5 = await prisma.product.findMany({ take: 5 });
        console.log('First 5 products:', JSON.stringify(first5, null, 2));
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
