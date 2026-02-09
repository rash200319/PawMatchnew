const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const testEmail = async () => {
    console.log('--- Email Configuration Check ---');
    console.log('SMTP_HOST:', process.env.SMTP_HOST);
    console.log('SMTP_USER:', process.env.SMTP_USER);
    console.log('SMTP_PASS:', process.env.SMTP_PASS ? '**** (Present)' : 'MISSING');

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error('❌ Missing email configuration in .env file.');
        return;
    }

    const transportConfig = process.env.SMTP_HOST === 'smtp.gmail.com'
        ? {
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        }
        : {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        };

    const transporter = nodemailer.createTransport(transportConfig);

    try {
        console.log('Attempting to verify connection...');
        await transporter.verify();
        console.log('✅ Connection successful!');

        console.log('Attempting to send test email...');
        const info = await transporter.sendMail({
            from: `"${process.env.SMTP_FROM_NAME || 'PawMatch Test'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER, // Send to self
            subject: "PawMatch Email Test",
            text: "If you are reading this, your email configuration is working correctly!",
            html: "<b>If you are reading this, your email configuration is working correctly!</b>",
        });

        console.log('✅ Test email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Check your inbox (' + process.env.SMTP_USER + ') to confirm receipt.');

    } catch (error) {
        console.error('❌ Email Test Failed:', error.message);
        if (error.responseCode === 535) {
            console.error('\n💡 TIP: For Gmail, you must use an "App Password" instead of your regular password.');
            console.error('1. Go to Google Account > Security > 2-Step Verification (Enable it)');
            console.error('2. Search for "App Passwords"');
            console.error('3. Generate one and paste it into your .env file as SMTP_PASS');
        }
    }
};

testEmail();
