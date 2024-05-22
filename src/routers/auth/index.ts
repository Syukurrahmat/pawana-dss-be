import { Router } from 'express';
import passport from 'passport';
import { isAuthenticated } from '../../middleware/userAccess.js';

const authRouter = Router();

// =================== /auth/* ===================

authRouter.post(
    '/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login?failed=true',
    })
);

authRouter.get('/verify/:token', (req, res, next) => {
    const { token } = req.params;
});

authRouter.get('/me',isAuthenticated, (req, res, next) => {
    const { userId, name, phone, email, role, profilePicture, isVerified } = req.user
    res.json({ userId, name, phone, email, role, profilePicture, isVerified })
});

export default authRouter;
