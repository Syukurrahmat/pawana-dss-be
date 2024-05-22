import { ProjectionAlias } from 'sequelize';
import db from '../models/index.js';
import { controllerType } from '../types/index.js';
import { parseQueries } from '../utils/utils.js';

export const searchUsers: controllerType = async (req, res, next) => {
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

export const searchCompanies: controllerType = async (req, res, next) => {
    const { page, limit, search, order, offset } = parseQueries(req, {
        sortOpt: ['createdAt', 'name', 'type'],
    });

    const role = req.query.role as string

    db.Companies.findAndCountAll({
        attributes: [
            'companyId',
            'name',
            'type'
        ],
        where: { ...search, ...(role ? { role } : {}) },
        order,
        limit,
        offset,
    }).then(({ count, rows: users }) => {
        res.json({
            success: true,
            totalItems: count,
            currentPage: page,
            pageSize: limit,
            result: users,
        });
    }).catch(next)
};

export const searchNodes: controllerType = async (req, res, next) => {
    const { page, limit, search, order, offset } = parseQueries(req, {
        sortOpt: ['createdAt', 'name', 'type'],
    });

    const withUserSub = req.query['info-sub-user'] as string
    const withCompanySub = req.query['info-sub-company'] as string

    let isSubscribedQuery: ProjectionAlias[] = []

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
            ,
            'status',
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



