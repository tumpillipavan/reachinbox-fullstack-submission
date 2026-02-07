import nodemailer from 'nodemailer';

export const createTransporter = async () => {
    // If env vars are set, use them. Otherwise generate a test account.
    if (process.env.ETHEREAL_EMAIL && process.env.ETHEREAL_PASS) {
        return nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: process.env.ETHEREAL_EMAIL,
                pass: process.env.ETHEREAL_PASS
            }
        });
    }

    const testAccount = await nodemailer.createTestAccount();
    console.log('Ethereal Test Account Created:', testAccount.user, testAccount.pass);

    return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });
};
