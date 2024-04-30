import { Router } from 'express';
import { Op, OrderItem } from 'sequelize';
import db from '../../models/index.js';
import jwt from 'jsonwebtoken';

const usersRouter = Router();

usersRouter
    .route('/users')
    .get(async (req, res, next) => {
        // Pagination
        let page = parseInt(req.query.page as string) || 1;
        let limit = parseInt(req.query.limit as string) || 10;

        if (page < 1) page = 1;
        if (limit < 1 || limit > 100) limit = 10;

        // Search
        const searchQuery = req.query.search as string;
        const searchObj = searchQuery ? { name: { [Op.like]: `%${searchQuery}%` } } : {};

        const role = req.query.role as string;
        const roleObj = role == 'admin' ? { role: 'admin' } : {};

        const whereObj = { isVerified: true, ...searchObj, ...roleObj };

        // Ordering
        const sort = req.query.sort as string;
        const order = req.query.order as string;

        const sortOpt = ['name', 'role', 'createdAt'];
        const orderItem: OrderItem = [
            sort && sortOpt.includes(sort) ? sort : sortOpt[0],
            order && order.toUpperCase() == 'DESC' ? 'DESC' : 'ASC',
        ];

        // Fetch data from DB

        try {
            const users = await db.Users.findAll({
                attributes: { exclude: ['updatedAt', 'password'] },
                where: whereObj,
                order: [orderItem],
                offset: (page - 1) * limit,
                limit: limit,
            });

            const usersCount = await db.Users.count({ where: whereObj });

            res.json({
                success: true,
                totalItems: usersCount,
                currentPage: page,
                pageSize: limit,
                result: users
                    .map((e) => e.toJSON())
                    .map(({ role, groups, ...rest }) => ({
                        ...rest,
                        role: groups?.length ? 'manager' : role,
                    })),
            });
        } catch (e) {
            next(e);
        }
    })
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
    .put((req, res, next) => {
        const { name, phone, description, address, profilePicture, userId } = req.body;

        console.log({ name, phone, description, address, profilePicture, userId });

        db.Users.update(
            { name, phone, description, address, profilePicture },
            { where: { userId } }
        )
            .then(([n]) => {
                if (n) {
                    res.json({
                        success: true,
                        message: 'Berhasil disunting',
                    });
                } else {
                    res.json({
                        success: false,
                        message: 'Gagal disunting',
                    });
                }
            })
            .catch(next);
    });

usersRouter.route('/users/:id').get((req, res, next) => {
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
