const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkSchema() {
    try {
        console.log('Checking Purchase model fields...');
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
