import express from 'express';
import cors from 'cors';
import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const connection = new IORedis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null,
});

const emailQueue = new Queue('email-queue', { connection });

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'verda.stamm75@ethereal.email',
        pass: 'A8Gm9th7FepR6UCdPW',
    }
});

app.post('/api/schedule', async (req, res) => {
    const { recipients, subject, body, startTime, scheduledAt } = req.body;
    const targetTime = startTime || scheduledAt;

    const delay = new Date(targetTime).getTime() - Date.now();
    console.log(`Received ${recipients.length} emails:`, recipients);
    console.log(`Base delay: ${Math.round(delay / 1000)}s`);

    const jobs = recipients.map((email: string, index: number) => ({
        name: 'send-email',
        data: { email, subject, body },
        opts: { delay: Math.max(0, delay) + (index * 2000) }
    }));

    await emailQueue.addBulk(jobs);
    res.json({ status: "Scheduled!" });
});

app.post('/schedule', async (req, res) => {
    const { recipients, subject, body, scheduledAt } = req.body;
    const delay = new Date(scheduledAt).getTime() - Date.now();
    console.log(`Received ${recipients.length} emails:`, recipients);
    console.log(`Base delay: ${Math.round(delay / 1000)}s`);

    const jobs = recipients.map((email: string, index: number) => ({
        name: 'send-email',
        data: { email, subject, body },
        opts: { delay: Math.max(0, delay) + (index * 2000) }
    }));

    await emailQueue.addBulk(jobs);
    res.json({ status: "Scheduled!" });
});


const worker = new Worker('email-queue', async (job) => {
    console.log(`Processing email for: ${job.data.email}`);

    try {
        await transporter.sendMail({
            from: '"ReachInbox Demo" <demo@reachinbox.ai>',
            to: job.data.email,
            subject: job.data.subject,
            text: job.data.body,
        });

        console.log(`✅ Sent to ${job.data.email}`);
    } catch (err) {
        console.error(`❌ Failed to send to ${job.data.email}`, err);
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

}, { connection, concurrency: 1 });

app.listen(5000, () => console.log('🚀 Backend running on Port 5000'));
