const nodemailer = require('nodemailer');
const path = require('path');
const dotenv = require('dotenv');

// 1. Manually specify the .env path like server.js
const envPath = path.join(__dirname, '../.env');
console.log(`Loading .env from: ${envPath}`);
const result = dotenv.config({ path: envPath, override: true });

if (result.error) {
    console.error('❌ Error loading .env:', result.error);
} else {
    console.log('✅ .env loaded successfully');
}

async function runDiagnostic() {
    console.log('\n--- Deep SMTP Diagnostic ---');

    console.log('1. Checking Environment Variables:');
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const host = process.env.SMTP_HOST;
    const from = process.env.SMTP_FROM_EMAIL;

    function checkVar(name, value) {
        if (!value) {
            console.error(`❌ ${name} is MISSING or UNDEFINED`);
            return false;
        }
        console.log(`✅ ${name}: "${value}" (Length: ${value.length})`);

        // Detect accidental quoting or whitespace
        if (value.startsWith('"') || value.endsWith('"') || value.startsWith("'") || value.endsWith("'")) {
            console.warn(`⚠️ WARNING: ${name} appears to be quoted inside .env. Remove quotes unless intentional.`);
        }
        if (value.trim() !== value) {
            console.error(`❌ ERROR: ${name} has leading/trailing whitespace! Trim it in .env.`);
        } else {
            console.log(`   (No leading/trailing whitespace detected)`);
        }
        return true;
    }

    checkVar('SMTP_USER', user);
    checkVar('SMTP_PASS', pass); // Be careful logging this - diagnosing length/format only
    checkVar('SMTP_HOST', host);

    // Validate Password Format for App Passwords
    const cleanPass = pass ? pass.replace(/\s/g, '') : '';
    if (cleanPass.length === 16) {
        console.log('✅ SMTP_PASS length (16 chars) is correct for Google App Password.');
    } else {
        console.warn(`⚠️ WARNING: SMTP_PASS length is ${cleanPass.length}. Google App Passwords should be 16 chars.`);
    }

    console.log('\n2. Verifying Transporter Configuration logic:');
    let transportConfig;
    if (host === 'smtp.gmail.com') {
        console.log('   Detecting Gmail host -> Using "service: gmail"');
        transportConfig = {
            service: 'gmail',
            auth: {
                user: user,
                pass: pass,
            },
        };
    } else {
        console.log('   Using custom SMTP host configuration');
        transportConfig = {
            host: host,
            port: process.env.SMTP_PORT || 587,
            secure: false, // TLS
            auth: {
                user: user,
                pass: pass,
            },
        };
    }

    console.log('   Config:', JSON.stringify({ ...transportConfig, auth: { ...transportConfig.auth, pass: '***REDACTED***' } }, null, 2));

    const transporter = nodemailer.createTransport(transportConfig);

    console.log('\n3. Testing Connection with transporter.verify():');
    try {
        await transporter.verify();
        console.log('✅ SMTP Connection Verified Successfully! (Capabilities exchange OK)');
    } catch (error) {
        console.error('❌ Connection Verification Failed:', error.message);
        if (error.response) console.error('   Server Response:', error.response);
        if (error.responseCode) console.error('   Response Code:', error.responseCode);
        return; // Stop if connection fails
    }

    console.log('\n4. Attempting to Send Test Email:');
    try {
        const info = await transporter.sendMail({
            from: `"${process.env.SMTP_FROM_NAME || 'Diagnostic Bot'}" <${from || user}>`,
            to: user, // Send to self
            subject: "Deep Diagnostic Test Email",
            text: "If you receive this, the email pipeline is working correctly.",
        });
        console.log('✅ Email sent successfully!');
        console.log('   Message ID:', info.messageId);
        console.log('   Accepted:', info.accepted);
        console.log('   Rejected:', info.rejected);
    } catch (error) {
        console.error('❌ Send Mail Failed:', error.message);
        if (error.response) console.error('   Server Response:', error.response);
        if (error.responseCode) console.error('   Response Code:', error.responseCode);

        console.log('\n--- Diagnosis ---');
        if (error.responseCode === 535) {
            console.log('🔒 Authentication Error (535 5.7.8):');
            console.log('   - Double check that 2-Step Verification is ON for the Google Account.');
            console.log('   - Verify the App Password was generated specifically for "Mail" on the device.');
            console.log('   - Ensure no other services are using the same App Password simultaneously (rate limiting).');
            console.log('   - Check "Security" tab in Google Account for blocked sign-in attempts.');
        }
    }
}

runDiagnostic();
