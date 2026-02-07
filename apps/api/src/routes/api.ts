import express, { Request, Response, NextFunction } from 'express';
import { googleLogin } from '../controllers/authController';
import { scheduleEmails, getScheduledEmails } from '../controllers/scheduleController';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to verify JWT
const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ error: 'No token provided' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        // @ts-ignore
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

router.post('/auth/google', googleLogin);
router.post('/schedule', authenticate, scheduleEmails);
router.get('/scheduled-emails', authenticate, getScheduledEmails);

export default router;
