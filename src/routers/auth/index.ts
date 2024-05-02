import { Router } from 'express';
import passport from 'passport';

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

export default authRouter;
