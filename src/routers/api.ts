import { Router } from 'express';
import dashboardData from './dashboardData.js';
import db from '../models/index.js';
import { Op, OrderItem, Sequelize } from 'sequelize';
import Users from '../models/users.js';

const router = Router();

router.get('/users', async (req, res, next) => {
    // Pagination
    let page = parseInt(req.query.page as string) || 1;
    let limit = parseInt(req.query.limit as string) || 10;

    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) limit = 10;

    // Search
    const searchQuery = req.query.search as string;
    const searchObj = searchQuery ? { name: { [Op.like]: `%${searchQuery}%` } } : {};

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
            where: { ...searchObj },
            order: [orderItem],
            offset: (page - 1) * limit,
            limit: limit,
        });

        const usersCount = await db.Users.count({ where: { ...searchObj } });

        res.json({
            success: true,
            totalItems: usersCount,
            currentPage: page,
            pageSize: limit,
            result: users.map((e) => e.toJSON()),
        });
    } catch (e) {
        next(e);
    }
});

router
    .route('/users/:id')
    .get((req, res) => {
        db.Users.findOne({ where: { userId: req.params.id } })
            .then((e) => {
                res.json(e);
            })
            .catch(() => {
                res.status(500).json();
            });
    })
    .post((req) => {
        console.log(req.params.id);
    })
    .put((req) => {
        console.log(req.params.id);
    })
    .delete((req) => {
        console.log(req.params.id);
    });

router.get('/groups', (req, res) => {
    db.Groups.findAll({
        attributes: { exclude: ['name', 'groupId', 'address', 'updatedAt'] },
        limit: 30,
        include: {
            model: db.Users,
            through: { where: { requestStatus: 'approved' } },
            attributes: ['userId'],
        },
    }).then((groups) => {
        res.json(
            groups.map(({ name, groupId, address, users }) => ({
                groupId,
                name,
                address,
                subscriptionCount: users.length,
            }))
        );
    });
});

router
    .route('/groups/:id')
    .get((req, res) => {
        db.Users.findOne({ where: { userId: req.params.id } })
            .then((e) => {
                res.json(e);
            })
            .catch(() => {
                res.status(500).json();
            });
    })
    .post((req) => {
        console.log(req.params.id);
    })
    .put((req) => {
        console.log(req.params.id);
    })
    .delete((req) => {
        console.log(req.params.id);
    });

router.get('/dashboard/data', async (req, res) => {
    res.json(await dashboardData());
});

export default router;
