import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { emailQueue } from '../lib/queue';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
    user?: { userId: string; email: string };
}

export const scheduleEmails = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        // @ts-ignore - Middleware will populate user
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { subject, body, recipients, startTime, delay, hourlyLimit } = req.body;
        // startTime is ISO string, delay is in seconds (converted to ms for BullMQ if needed, but we handle in worker usually, 
        // though Prompt asked for "Delay between each email" which we handle in worker. 
        // BUT start time is delayed job).

        // Update user's hourly limit if provided
        if (hourlyLimit) {
            await prisma.user.update({
                where: { id: userId },
                data: { hourlyLimit: parseInt(hourlyLimit) }
            });
        }

        const scheduledJobs = [];
        const startTimestamp = new Date(startTime).getTime();
        const now = Date.now();
        // If start time is in past, start now.
        let initialDelay = Math.max(0, startTimestamp - now);

        // We will schedule all of them to start at 'startTime'. 
        // The worker will pick them up and throttle them one by one.
        // OR we can stagger them here. 
        // Requirements: "Schedules them to be sent at a specific time".
        // Requirements: "Minimum delay between individual email sends".
        // Strategy: Add all to queue with same delay. Worker concurrency=1 or throttling logic handles the spacing.

        for (const recipient of recipients) {
            // 1. Create DB Record
            const scheduledEmail = await prisma.scheduledEmail.create({
                data: {
                    subject,
                    body,
                    recipient: recipient.trim(),
                    userId,
                    scheduledAt: new Date(startTime),
                    status: 'PENDING'
                }
            });

            // 2. Add to BullMQ
            await emailQueue.add('send-email', {
                scheduledEmailId: scheduledEmail.id,
                userId
            }, {
                delay: initialDelay,
                removeOnComplete: true,
                removeOnFail: false
            });

            scheduledJobs.push(scheduledEmail);
        }

        res.json({ message: `Scheduled ${scheduledJobs.length} emails`, jobs: scheduledJobs });

    } catch (error) {
        console.error('Schedule Error:', error);
        res.status(500).json({ error: 'Scheduling failed' });
    }
};

export const getScheduledEmails = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        // @ts-ignore
        const userId = req.user?.userId;
        const emails = await prisma.scheduledEmail.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(emails);
    } catch (error) {
        res.status(500).json({ error: 'Fetch failed' });
    }
};
