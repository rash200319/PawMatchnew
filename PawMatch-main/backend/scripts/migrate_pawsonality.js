const db = require('../config/db');
require('dotenv').config();

async function migratePawsonality() {
    try {
        const dbName = process.env.DB_NAME || 'pawmatch';

        // Check if column exists
        const checkQuery = `
      SELECT COUNT(*) AS count 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = '${dbName}' 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'pawsonality_results'
    `;
        const result = await db.query(checkQuery);
        const count = result.rows[0].count;

        if (count > 0) {
            console.log('Column "pawsonality_results" already exists in "users" table.');
        } else {
            await db.query(`ALTER TABLE users ADD COLUMN pawsonality_results JSON`);
            console.log('Added "pawsonality_results" column to "users" table.');
        }
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migratePawsonality();
