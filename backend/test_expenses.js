import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
    try {
        const expense = await prisma.expense.findFirst();
        console.log('Sample Expense:', JSON.stringify(expense, null, 2));

        const count = await prisma.expense.count();
        console.log('Total Expenses:', count);

        // Check if date column exists and has values
        const expenses = await prisma.expense.findMany({
            take: 5
        });
        console.log('Last 5 expenses date values:', expenses.map(e => e.date));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

test();
