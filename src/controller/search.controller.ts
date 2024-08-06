import { ProjectionAlias, WhereOptions } from 'sequelize';
import db from '../models/index.js';
import { ControllerType, QueryOfSting } from '../types/index.js';
import { parseQueries } from '../utils/common.utils.js';

export const searchUsers: ControllerType = async (req, res, next) => {
    const { page, limit, search, order, offset } = parseQueries(req, {
        sortOpt: ['createdAt', 'name', 'role'],
    });

    db.Users.findAndCountAll({
        attributes: ['userId', 'profilePicture', 'name'],
        where: { isVerified: true, ...search },
        limit,
        offset,
        order
    })
        .then(({ count, rows: users }) => {
            res.json({
                success: true,
                totalItems: count,
                currentPage: page,
                pageSize: limit,
                result: users,
            });
        })
        .catch(next)
};

export const searchCompanies: ControllerType = async (req, res, next) => {
    const { page, limit, search, order, offset } = parseQueries(req, {
        sortOpt: ['createdAt', 'name', 'type'],
    });

    const where: WhereOptions = { ...search }

    const isManager = req.user!.role == 'manager'
    if (isManager) { where.managedBy = req.user!.userId }


    try {
        const { count, rows: users } = await db.Companies.findAndCountAll({
            attributes: [
                'companyId',
                'name',
                'type'
            ],
            where,
            order,
            limit,
            offset,
        })

        res.json({
            success: true,
            totalItems: count,
            currentPage: page,
            pageSize: limit,
            result: users,
        });


    } catch (error) { next(error) }
};


// api/companies/:id/avaiable-node
// api/users/:id/avaiable-node

export const searchNodes: ControllerType = async (req, res, next) => {
    const { page, limit, search, order, offset } = parseQueries(req, {
        sortOpt: ['createdAt', 'name', 'type'],
    });

    const userId = parseInt(req.query.userId as string)
    const companyId = parseInt(req.query.companyId as string)

    // Tolak permintaan jika kedua nilai diisi, atau tidak diisi sama sekali
    if ([userId, companyId].filter(e => e).length != 1) {
        return res.status(400).send('Bad Request')
    }

    let isSubscribedQuery: ProjectionAlias[] = []

    if (userId) {
        if (req.user!.role !== 'admin' && req.user!.userId !== userId) {
            return res.status(403).send('Forbidden')
        }
    }

    const withUserSub = req.query['info-sub-user'] as string
    const withCompanySub = req.query['info-sub-company'] as string


    if (withUserSub) isSubscribedQuery = [[
        db.sequelize.literal(`(
            SELECT COUNT(*) FROM userssubscriptions
            WHERE userssubscriptions.nodeId = Nodes.nodeId
            AND userssubscriptions.userId = ${withUserSub || 'null'}
        )`),
        'isSubscribed',
    ]]

    if (withCompanySub) isSubscribedQuery = [[
        db.sequelize.literal(`(
            SELECT COUNT(*) FROM companysubscriptions
            WHERE companysubscriptions.nodeId = Nodes.nodeId
            AND companysubscriptions.companyId = ${withCompanySub || 'null'}
        )`),
        'isSubscribed',
    ]]

    if (isSubscribedQuery.length) order.unshift([db.sequelize.literal('isSubscribed'), 'ASC'])

    db.Nodes.findAndCountAll({
        attributes: [
            'nodeId',
            'name',
            'isUptodate',
            'createdAt',
            ...isSubscribedQuery
        ],
        where: { ...search },
        order,
        limit,
        offset,
    })
        .then(({ count, rows: users }) => {
            res.json({
                success: true,
                totalItems: count,
                currentPage: page,
                pageSize: limit,
                result: users,
            });
        })
        .catch(next)
};



