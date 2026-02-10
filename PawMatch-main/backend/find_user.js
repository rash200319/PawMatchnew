const db = require('./config/db');

async function findUser() {
    try {
        const email = 'pabodarashmi668@gmail.com';
        const userRes = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        console.log('--- USER FIND ---');
        console.log(JSON.stringify(userRes.rows, null, 2));

        if (userRes.rows.length > 0) {
            const userId = userRes.rows[0].id;
            const shelterRes = await db.query('SELECT * FROM shelters WHERE user_id = ?', [userId]);
            console.log('--- SHELTER FIND ---');
            console.log(JSON.stringify(shelterRes.rows, null, 2));
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

findUser();
