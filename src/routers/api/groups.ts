import { Router } from 'express';
import db from '../../models/index.js';
import { buildQuery } from '../../utils/utils.js';

const groupsRouter = Router();

const membersCountHasGroupQuery =
    "(SELECT COUNT(*) FROM `users` INNER JOIN `grouppermissions` ON `users`.`userId` = `grouppermissions`.`userId` WHERE `grouppermissions`.`groupId` = `Groups`.`groupId` AND `grouppermissions`.`requestStatus` = 'approved')";

const memberRequestCountHasGroupQuery =
    "(SELECT COUNT(*) FROM `users` INNER JOIN `grouppermissions` ON `users`.`userId` = `grouppermissions`.`userId` WHERE `grouppermissions`.`groupId` = `Groups`.`groupId` AND `grouppermissions`.`requestStatus` = 'pending')";

const nodesCountHasGroupQuery =
    '(SELECT COUNT(*) FROM `nodes` WHERE `nodes`.`groupId` = `Groups`.`groupId`)';

groupsRouter
    .route('')
    .get(async (req, res, next) => {
        const { page, limit, search, order } = buildQuery(req, {
            searchField: 'name',
            sortOpt: ['name', 'createdAt'],
        });

        // Fetch data from DB
        try {
            const { count, rows: groups } = await db.Groups.findAndCountAll({
                attributes: {
                    exclude: ['updatedAt', 'description'],
                    include: [
                        [db.sequelize.literal(membersCountHasGroupQuery), 'membersCount'],
                        [db.sequelize.literal(nodesCountHasGroupQuery), 'nodeCount'],
                        [
                            db.sequelize.literal(memberRequestCountHasGroupQuery),
                            'memberRequestsCount',
                        ],
                    ],
                },
                include: {
                    model: db.Users,
                    through: {
                        where: { permission: 'manager' },
                        attributes: [],
                    },
                    attributes: ['userId', 'name'],
                },

                where: { ...search },
                order,
                offset: (page - 1) * limit,
                limit,
            });

            res.json({
                success: true,
                totalItems: count,
                currentPage: page,
                pageSize: limit,
                result: groups
                    .map((e) => e.toJSON())
                    .map(({ users, ...rest }) => ({ ...rest, manager: users[0] || {} })),
            });
        } catch (e) {
            next(e);
        }
    })
    .post((req, res, next) => {
        const { name, description, address } = req.body;
        db.Groups.create({
            name,
            description,
            address,
        })
            .then((e) => {
                res.json({
                    success: true,
                    message: 'Grup berhasil dibuat',
                    result: {
                        groupId: e.groupId,
                    },
                });
            })

            .catch(next);
    })
    .put(async (req, res, next) => {
        const { name, address, description, groupId } = req.body;

        console.log({
            name,
            description,
        });

        db.Groups.update(
            {
                name,
                description,
                address,
            },
            { where: { groupId } }
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

groupsRouter.get('/:id', async (req, res, next) => {
    try {
        const group = await db.Groups.findOne({
            where: { groupId: req.params.id },
            attributes: {
                include: [
                    [db.sequelize.literal(membersCountHasGroupQuery), 'membersCount'],
                    [db.sequelize.literal(nodesCountHasGroupQuery), 'nodeCount'],
                    [db.sequelize.literal(memberRequestCountHasGroupQuery), 'memberRequestsCount'],
                ],
            },
            include: {
                model: db.Users,
                attributes: ['name', 'userId', 'phone', 'profilePicture', 'email'],
                through: {
                    attributes: [],
                    where: {
                        permission: 'manager',
                        requestStatus: 'approved',
                    },
                },
            },
        });

        if (!group) {
            res.json({
                success: false,
                message: 'Grup tidak ditemukan',
            });
            return;
        }

        const { users, ...rest } = group.toJSON();

        res.json({
            success: true,
            result: {
                ...rest,
                manager: users.length ? users[0] : null,
            },
        });
    } catch (error) {
        next(error);
    }
});

groupsRouter.get('/:id/users', async (req, res, next) => {
    const { page, limit, search, order } = buildQuery(req, {
        searchField: 'name',
        sortOpt: ['name', 'createdAt'],
    });

    const groupId = req.params.id;
    const status = (req.query.status as string) || 'approved';

    const filteringObj = {
        through: {
            where: {
                requestStatus: status,
            },
        },
        ...search,
    };

    try {
        const group = await db.Groups.findOne({ where: { groupId } });

        if (!group) {
            res.json({
                success: false,
                message: 'Grup tidak ditemukan',
            });
            return;
        }

        const users = await group.getUsers({
            ...filteringObj,
            attributes: ['userId', 'name', 'profilePicture'],
            joinTableAttributes: ['permission', 'joinedAt', 'requestStatus'],
            order,
            offset: (page - 1) * limit,
            limit,
        });

        const count = await group.countUsers({ ...(filteringObj as any) });

        res.json({
            success: true,
            totalItems: count,
            currentPage: page,
            pageSize: limit,
            result: users.map((f) => f.toJSON()),
        });
    } catch (error) {
        next(error);
    }
});

groupsRouter.get('/:id/nodes', async (req, res, next) => {
    const { page, limit, search, order } = buildQuery(req, {
        searchField: 'name',
        sortOpt: ['name', 'timestamp'],
    });

    const groupId = req.params.id;

    try {
        const group = await db.Groups.findOne({ where: { groupId } });

        if (!group) {
            res.json({
                success: false,
                message: 'Grup tidak ditemukan',
            });
            return;
        }

        const nodes = await group.getNodes({
            attributes: ['nodeId', 'name', 'longitude', 'latitude', 'status', 'environment'],
            order,
            offset: (page - 1) * limit,
            limit,
        });

        const count = await group.countNodes();

        res.json({
            success: true,
            totalItems: count,
            currentPage: page,
            pageSize: limit,
            result: nodes.map((f) => f.toJSON()),
        });
    } catch (error) {
        next(error);
    }
});

export default groupsRouter;
