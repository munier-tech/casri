
const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL
});

async function main() {
    try {
        await client.connect();
        console.log('Connected to database');

        const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'Purchase'");
        console.log('Columns in Purchase table:');
        console.log(JSON.stringify(res.rows, null, 2));

        const sample = await client.query('SELECT * FROM "Purchase" LIMIT 1');
        console.log('\nSample Record Keys:');
        if (sample.rows.length > 0) {
            console.log(Object.keys(sample.rows[0]));
        } else {
            console.log('No records found');
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

main();
