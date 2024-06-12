import jwt from 'jsonwebtoken';
import { Router } from 'express';
import passport from 'passport';
import db from '../../models/index.js';

const authRouter = Router();

authRouter.post('/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login?failed=true',
    })
);

authRouter.get('/verify/:token', (req, res, next) => {
    const { token } = req.params;


    jwt.verify(token, process.env.JWT_SECRETKEY, async (err, decoded) => {
        if (err) {
            return res.status(400).json({ message: 'Token tidak valid atau kadaluarsa' });
        }

        //@ts-ignore
        const user = await db.Users.findOne({ where: { email: decoded.email } })

        console.log(user)

        if (!user) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
        }

        user.isVerified = true;
        await user.save()

        res.status(200).json({ message: 'Email berhasil diverifikasi' });
    });

});

authRouter.get('/me', async (req, res, next) => {
    const { password, address, description, ...rest } = req.user.toJSON()

    const countSubscribedNodes = await req.user.countSubscribedNodes()
    const countManagedCompany = await req.user.countCompanies()

    res.json({ ...rest, countSubscribedNodes, countManagedCompany })
});

export default authRouter;