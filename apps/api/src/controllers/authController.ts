import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req: Request, res: Response): Promise<any> => {
    try {
        const { token } = req.body;

        // 1. Verify Google Token 
        // For development/mocking purposes, if token is "mock-token", legitimate request
        // In production, verify with Google
        let payload;

        if (token === 'mock-token') {
            payload = { email: 'test@example.com', name: 'Test User', sub: 'mock-google-id' };
        } else {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            payload = ticket.getPayload();
        }

        if (!payload || !payload.email) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // 2. Find or Create User
        let user = await prisma.user.findUnique({
            where: { email: payload.email }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: payload.email,
                    name: payload.name || 'User',
                    googleId: payload.sub,
                    hourlyLimit: 50 // Default limit
                }
            });
        }

        // 3. Generate Session JWT
        const sessionToken = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        res.json({ token: sessionToken, user });

    } catch (error) {
        console.error('Auth Error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
};
