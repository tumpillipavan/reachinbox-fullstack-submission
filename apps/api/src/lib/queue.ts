import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL as string, {
    maxRetriesPerRequest: null,
});

export const emailQueue = new Queue('email-queue', { connection });

export const redisConnection = connection;
