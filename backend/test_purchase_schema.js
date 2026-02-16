import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSchema() {
    try {
        console.log('Checking Purchase model fields...');
        // We can't easily list fields via Prisma without DMMF, but we can try a create with intentional error
        // to see what fields it expects.
        try {
            await prisma.purchase.create({
                data: {}
            });
        } catch (err) {
            console.log('Prisma Error (Expected):');
            console.log(err.message);
        }
    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkSchema();
