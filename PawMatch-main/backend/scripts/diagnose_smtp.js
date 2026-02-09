const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const verifySmtp = async () => {
    console.log('\n--- SMTP Diagnostics ---');
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!user || !pass) {
        console.error('❌ Missing SMTP_USER or SMTP_PASS in .env');
        return;
    }

    console.log(`User: ${user}`);
    console.log(`Password Length: ${pass.length} characters`);

    // Check if it looks like an App Password (usually 16 chars, often with spaces in UI but spaces might be stripped or not)
    // Google App Passwords are 16 characters long.
    const cleanPass = pass.replace(/\s/g, '');
    if (cleanPass.length !== 16) {
        console.warn(`⚠️ WARNING: Your password is ${cleanPass.length} characters long.`);
        console.warn(`   Google App Passwords are exactly 16 characters (not including spaces).`);
        console.warn(`   If you are using your regular Google Account password, IT WILL NOT WORK.`);
        console.warn(`   You MUST generate an App Password at https://myaccount.google.com/apppasswords`);
    } else {
        console.log('✅ Password length (16 chars) suggests it IS an App Password.');
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: user,
            pass: pass,
        },
    });

    try {
        await transporter.verify();
        console.log('✅ SMTP Connection Verified Successfully!');
    } catch (error) {
        console.error('❌ Connection Failed:', error.message);
        if (error.responseCode === 535) {
            console.error('\n🔴 AUTHENTICATION ERROR (535 5.7.8)');
            console.error('This means Google rejected the password.');
            console.error('Action Required:');
            console.error('1. Go to https://myaccount.google.com/apppasswords');
            console.error('2. Generate a new App Password for "Mail"');
            console.error('3. Replace the content of SMTP_PASS in your .env file with the 16-character code.');
        }
    }
};

verifySmtp();
