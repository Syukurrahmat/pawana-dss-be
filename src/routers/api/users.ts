import { Router } from 'express';
import db from '../../models/index.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { buildQuery, salt } from '../../utils/utils.js';

// ================== /api/users/* ==================

const usersRouter = Router();
usersRouter
    .route('')
    // ==================== GET ====================
    .get(async (req, res, next) => {
        const { page, limit, search, order } = buildQuery(req, {
            searchField: 'name',
            sortOpt: ['name', 'role', 'createdAt'],
        });

        const whereObj = { isVerified: true, ...search };

        // Fetch data from DB

        try {
            const { count, rows: users } = await db.Users.findAndCountAll({
                attributes: ['userId', 'name', 'phone', 'profilePicture', 'email', 'createdAt'],
                where: whereObj,
                offset: (page - 1) * limit,
                order,
                limit,
            });

            res.json({
                success: true,
                totalItems: count,
                currentPage: page,
                pageSize: limit,
                result: users.map((e) => e.toJSON()),
            });
        } catch (e) {
            next(e);
        }
    })
    // ==================== POST ====================
    .post(async (req, res, next) => {
        const { name, email, phone, address, description, profilePicture } = req.body;

        // check Email
        const emailAlready = await db.Users.count({ where: { email: req.body.email } }).catch(next);

        if (emailAlready) {
            res.json({
                success: false,
                message: 'Alamat Surel Telah digunakan di akun lain',
            });
            return;
        }

        const user = await db.Users.create({
            name,
            email,
            phone,
            address,
            description,
            profilePicture,
        }).catch(next);

        if (!user) return next();

        const token = jwt.sign(
            { userId: user.userId, email: user.email },
            process.env.JWT_SECRETKEY,
            { expiresIn: '3 days' }
        );

        const verificationURL = 'http://localhost:3000/verify/' + token;

        // send Email
        console.log();
        console.log(user.email, user.name, verificationURL);
        console.log();

        res.json({
            success: true,
            message: 'Akun Berhasil dibuat. Email Verifikasi dikirimkan ke email pengguna ',
        });
    })
    // ==================== PUT ====================
    .put(async (req, res, next) => {
        const { name, phone, description, address, profilePicture, userId } = req.body;
        const { password, newPassword } = req.body;

        console.log({
            name,
            phone,
            description,
            address,
            profilePicture,
            password,
            newPassword,
            userId,
        });

        const isUpdatePassword = password && newPassword;

        if (isUpdatePassword) {
            try {
                const user = await db.Users.findOne({
                    where: { userId },
                    attributes: ['password'],
                });

                if (!bcrypt.compareSync(password, user.password)) {
                    res.json({
                        success: false,
                        message: 'Kata sandi tidak tepat',
                    });
                    return;
                }
            } catch (error) {
                next(error);
            }
        }

        db.Users.update(
            {
                name,
                phone,
                description,
                address,
                profilePicture,
                password: isUpdatePassword ? bcrypt.hashSync(newPassword, salt) : undefined,
            },
            { where: { userId } }
        )
            .then(([n]) => {
                if (n) {
                    res.json({
                        success: true,
                        message: 'Berhasil diperbarui',
                    });
                } else {
                    res.json({
                        success: false,
                        message: 'Gagal diperbarui',
                    });
                }
            })
            .catch(next);
    });

usersRouter.route('/:id').get((req, res, next) => {
    db.Users.findOne({
        where: { userId: req.params.id, isVerified: true },
        attributes: { exclude: ['createdAt', 'updatedAt', 'password'] },
        include: [
            {
                model: db.Groups,
                attributes: ['groupId', 'name'],
                through: {
                    attributes: {
                        exclude: ['updatedAt', 'groupId', 'userId'],
                    },
                },
            },
        ],
    })
        .then((e) => {
            if (!e) {
                res.json({
                    success: false,
                    message: 'user tidak ditemukan',
                });
                return;
            }
            const { groups, ...rest } = e.toJSON();

            const result = {
                ...rest,
                groups: groups
                    .map(({ GroupPermissions, ...rest }) => ({
                        ...rest,
                        ...GroupPermissions,
                    }))
                    .sort((a, b) => {
                        const statusOrder = { approved: 0, pending: 1, rejected: 2 };
                        return statusOrder[a.requestStatus] - statusOrder[b.requestStatus];
                    }),
            };

            res.json({ success: true, result });
        })
        .catch(next);
});

export default usersRouter;
