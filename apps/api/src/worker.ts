import { Worker, Job } from 'bullmq';
import { redisConnection } from './lib/queue';
import { createTransporter } from './lib/mailer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const WORKER_CONCURRENCY = 2; // Keep low to demonstrate rate limiting
const EMAIL_DELAY_MS = 2000; // 2 seconds delay between emails (Throttling)

export const emailWorker = new Worker('email-queue', async (job: Job) => {
    const { scheduledEmailId, userId } = job.data;

    console.log(`Processing job ${job.id} for email ${scheduledEmailId}`);

    // 1. Fetch User and Email details
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const email = await prisma.scheduledEmail.findUnique({ where: { id: scheduledEmailId } });

    if (!user || !email) {
        throw new Error('User or Email not found');
    }

    // 2. Hourly Rate Limiting Check
    const now = new Date();
    const currentHour = now.toISOString().slice(0, 13); // e.g., "2023-10-27T10"
    const redisKey = `sent:${userId}:${currentHour}`;

    const currentCount = await redisConnection.get(redisKey);
    const count = currentCount ? parseInt(currentCount) : 0;

    if (count >= user.hourlyLimit) {
        console.log(`Rate limit reached for user ${userId}. Rescheduling...`);
        // Move to next hour
        const nextHour = new Date(now);
        nextHour.setHours(nextHour.getHours() + 1);
        nextHour.setMinutes(0);
        nextHour.setSeconds(0);
        nextHour.setMilliseconds(0);

        await job.moveToDelayed(nextHour.getTime(), job.token);

        // Update status in DB
        await prisma.scheduledEmail.update({
            where: { id: scheduledEmailId },
            data: { status: 'DELAYED' }
        });
        return;
    }

    // 3. Throttling (Delay between sends)
    await new Promise(resolve => setTimeout(resolve, EMAIL_DELAY_MS));

    // 4. Send Email
    try {
        const transporter = await createTransporter();
        await transporter.sendMail({
            from: '"ReachInbox Scheduler" <scheduler@reachinbox.com>',
            to: email.recipient,
            subject: email.subject,
            text: email.body,
        });

        // 5. Update Rate Limit Counter
        await redisConnection.incr(redisKey);
        // Set expiry for 24h just to be safe (though strictly not needed if key changes hourly)
        await redisConnection.expire(redisKey, 86400);

        // 6. Update DB Status
        await prisma.scheduledEmail.update({
            where: { id: scheduledEmailId },
            data: { status: 'SENT' }
        });

        console.log(`Email ${scheduledEmailId} sent successfully.`);

    } catch (error: any) {
        console.error(`Failed to send email ${scheduledEmailId}:`, error);
        await prisma.scheduledEmail.update({
            where: { id: scheduledEmailId },
            data: { status: 'FAILED' }
        });
        throw error;
    }

}, {
    connection: redisConnection,
    concurrency: WORKER_CONCURRENCY,
    limiter: {
        max: 100, // Safe guard global limit per second
        duration: 1000
    }
});

emailWorker.on('completed', job => {
    console.log(`Job ${job.id} completed`);
});

emailWorker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed with ${err.message}`);
});
