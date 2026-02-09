const db = require('../config/db');
require('dotenv').config();

async function migrate() {
    try {
        const dbName = process.env.DB_NAME || 'pawmatch';

        // Check if table exists
        const tableCheckQuery = `
      SELECT COUNT(*) AS count 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = '${dbName}' 
      AND TABLE_NAME = 'animal_reports'
    `;
        const tableResult = await db.query(tableCheckQuery);
        const tableExists = tableResult.rows[0].count > 0;

        if (!tableExists) {
            console.log('Table "animal_reports" does not exist. Creating it...');
            const createTableQuery = `
            CREATE TABLE animal_reports (
                id INT AUTO_INCREMENT PRIMARY KEY,
                animal_type VARCHAR(50),
                condition_type VARCHAR(50),
                location VARCHAR(255),
                description TEXT,
                contact_name VARCHAR(100),
                contact_phone VARCHAR(50),
                status VARCHAR(20) DEFAULT 'pending',
                images JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
            await db.query(createTableQuery);
            console.log('Created table "animal_reports" with "images" column.');
        } else {
            console.log('Table "animal_reports" exists. Checking for "images" column...');
            const columnCheckQuery = `
          SELECT COUNT(*) AS count 
          FROM information_schema.COLUMNS 
          WHERE TABLE_SCHEMA = '${dbName}' 
          AND TABLE_NAME = 'animal_reports' 
          AND COLUMN_NAME = 'images'
        `;

            const columnResult = await db.query(columnCheckQuery);
            const columnExists = columnResult.rows[0].count > 0;

            if (columnExists) {
                console.log('Column "images" already exists in "animal_reports" table.');
            } else {
                await db.query(`ALTER TABLE animal_reports ADD COLUMN images JSON`);
                console.log('Added "images" column to "animal_reports" table.');
            }
        }
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
