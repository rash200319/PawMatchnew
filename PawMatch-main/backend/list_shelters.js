const db = require('./config/db');

async function listShelters() {
    try {
        const res = await db.query('SELECT user_id, organization_name, contact_number FROM shelters');
        console.log('--- ALL SHELTERS ---');
        console.log(JSON.stringify(res.rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listShelters();
