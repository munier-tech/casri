
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const res = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'Purchase'`;
        console.log('Database Columns in Purchase table:');
        console.log(JSON.stringify(res, null, 2));

        const sample = await prisma.$queryRaw`SELECT * FROM "Purchase" LIMIT 1`;
        console.log('\nSample Purchase Record Keys:');
        if (sample.length > 0) {
            console.log(Object.keys(sample[0]));
        } else {
            console.log('No records found');
        }
    } catch (err) {
        console.error('Error checking DB:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
