const db = require('./config/db');

async function checkCols() {
    try {
        const res = await db.query('DESCRIBE shelters');
        console.log('--- SHELTERS COLUMNS ---');
        res.rows.forEach(row => console.log(row.Field));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkCols();
