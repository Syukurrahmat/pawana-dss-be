import db from '../models/index.js';
import { controllerType } from '../types/index.js';
import { buildQuery } from '../utils/utils.js';

export const searchUsersWithSubsStatus: controllerType = async (req, res, next) => {
    const { page, limit, search, order, offset } = buildQuery(req, {
        searchField: 'name',
        sortOpt: ['name', 'createdAt'],
    });

    const groupId = req.query['is-in-group'] as string;

    try {
        const { count, rows: users } = await db.Users.findAndCountAll({
            attributes: [
                'userId',
                'profilePicture',
                'name',
                [
                    db.sequelize.literal(`
                        (SELECT COUNT(*) FROM grouppermissions
                            WHERE grouppermissions.userId = Users.userId
                            AND grouppermissions.requestStatus = "approved"
                            AND grouppermissions.groupId = ${groupId || 'null'}
                        )
                    `),
                    'isInGroup',
                ],
            ],
            where: { isVerified: true, ...search },
            order: [[db.sequelize.literal('isInGroup'), 'ASC'], ...order],
            limit,
            offset,
        });

        res.json({
            success: true,
            totalItems: count,
            currentPage: page,
            pageSize: limit,
            result: users,
        });
    } catch (e) {
        next(e);
    }
};

export const searchGoupWithSubsStatus: controllerType = async (req, res, next) => {
    const { page, limit, search, order, offset } = buildQuery(req, {
        searchField: 'name',
        sortOpt: ['name', 'createdAt'],
    });

    const userId = req.query['is-has-user'] as string;

    try {
        const { count, rows: users } = await db.Groups.findAndCountAll({
            attributes: [
                'groupId',
                'name',
                [
                    db.sequelize.literal(`
                        (SELECT requestStatus FROM grouppermissions
                            WHERE grouppermissions.groupId = Groups.groupId
                            AND grouppermissions.userId = ${userId || 'null'}
                        )
                    `),
                    'status',
                ],
            ],
            where: { ...search },
            order: [[db.sequelize.literal('status'), 'ASC'], ...order],
            limit,
            offset,
        });

        res.json({
            success: true,
            totalItems: count,
            currentPage: page,
            pageSize: limit,
            result: users,
        });
    } catch (e) {
        next(e);
    }
};
