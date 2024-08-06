import jwt from 'jsonwebtoken';
import { Router } from 'express';
import passport from 'passport';
import db from '../../models/index.js';
import { myBcriptSalt } from '../../utils/common.utils.js';
import Randomstring from 'randomstring';
import bcrypt from 'bcryptjs';

const authRouter = Router();

authRouter.post('/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login?failed=true',
    })
);

authRouter.delete('/logout', (req, res, next) => {
    req.logOut((err) => {
        if (err) return next(err)
        res.json({ success: true })
    });
});

authRouter.get('/verify/:token', (req, res, next) => {
    const { token } = req.params;

    jwt.verify(token, process.env.JWT_SECRETKEY!, async (err, decoded) => {
        if (err) {
            return res.status(400).json({ message: 'Token tidak valid atau kadaluarsa' });
        }

        //@ts-ignore
        const user = await db.Users.findOne({ where: { email: decoded.email } })

        if (!user) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
        }

        if (user.isVerified) {
            return res.status(200).json({ message: 'Akun sudah diverifikasi sebelumnya' });
        }

        const password = Randomstring.generate(12)

        user.isVerified = true;
        user.password = password;

        await user.save()


        res.status(200).json({ message: 'Email berhasil diverifikasi', password: password });
    });

});


export default authRouter;