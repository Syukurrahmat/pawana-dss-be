import { Op, ProjectionAlias } from 'sequelize';
import db from '../models/index.js';
import { ControllerType, QueryOfSting } from '../types/index.js';
import { parseQueries } from '../utils/common.utils.js';
import { v4 as uuidV4 } from 'uuid';
import moment from 'moment';
import Nodes from '../models/nodes.js';


/**
 * Mendapatkan semua Node
 */
export const getAllNodes: ControllerType = async (req, res, next) => {
    const { page, limit, search, order, offset } = parseQueries(req, {
        sortOpt: ['name', 'createdAt'],
    });


    const all = req.query.all as string == 'true'
    const paginationObj = all ? {} : { order, offset, limit }

    db.Nodes.findAndCountAll({
        attributes: { exclude: ['address', 'instalationDate', 'description', 'apiKey', 'updatedAt'] },
        where: { ...search },
        ...paginationObj
    })
        .then(({ count, rows: nodes }) => {
            res.json({
                success: true,
                totalItems: count,
                currentPage: page,
                pageSize: all ? Infinity : limit,
                result: nodes,
            });
        })
        .catch(next);
};

/**
 * Mendapatkan Ringkasan Jumlah Nodes
 */
export const getNodesSummary: ControllerType = async (req, res, next) => {
    try {
        const all = await db.Nodes.count()
        const publicNodes = await db.Nodes.count({ where: { companyId: { [Op.is]: null } } });
        const privateNodes = await db.Nodes.count({ where: { companyId: { [Op.not]: null } } });

        const ownership = [
            { value: 'public', count: publicNodes },
            { value: 'private', count: privateNodes }
        ]

        const statusEnum = ['active', 'nonactive', 'idle']
        const countEachStatus: any = await db.Nodes.findAll({
            attributes: [
                'status',
                [db.sequelize.fn('COUNT', db.sequelize.col('status')), 'count']
            ],
            group: 'status',
            raw: true
        });

        let status = statusEnum.map(e => ({
            value: e,
            count: countEachStatus.find(({ status }) => status == e)?.count || 0
        }))

        res.json({
            success: true,
            result: {
                all,
                ownership,
                status
            }
        })

    } catch (error) {
        next(error)
    }
}

export const createNewNode: ControllerType = async (req, res, next) => {
    const { name, description, address, status, coordinate, instalationDate, companyId } = req.body;

    const company = companyId ? await db.Companies.findByPk(companyId) : null
    const nodeStatus = status == 'nonactive' ? 'nonactive' : undefined
    const apiKey = uuidV4()

    try {
        const newNode = company ?
            await db.Nodes.create({
                companyId,
                address: company.address,
                coordinate: company.coordinate,
                name,
                description,
                instalationDate,
                status: nodeStatus,
                apiKey,
            })
            :
            await db.Nodes.create({
                address,
                coordinate,
                name,
                description,
                instalationDate,
                status: nodeStatus,
                apiKey,
            })

        res.json({
            success: Boolean(newNode),
            message: newNode ? 'Node Berhasil dibuat' : 'Node Gagal Dibuat',
            result: { nodeId: newNode.nodeId }
        });

    } catch (error) { console.log(error) }
};

export const getNodeById: ControllerType = async (req, res, next) => {
    const nodeId = req.params.id

    const node = await db.Nodes.findByPk(nodeId, {
        include: {
            model: db.Companies, as: 'owner', attributes: ['companyId', 'name', 'type']
        }
    })

    if (!node) {
        return res.json({
            success: false,
            message: 'Node tidak ditemukan',
        });
    }

    const countUserSubscription = await db.UsersSubscription.count({ where: { nodeId } })
    const countCompanySubscribtion = await db.CompanySubscription.count({ where: { nodeId } })

    res.json({
        success: true, result: {
            ...node.toJSON(),
            countUserSubscription,
            countCompanySubscribtion
        }
    });

};

export const editNode: ControllerType = async (req, res, next) => {
    const { name, description, coordinate, address, instalationDate } = req.body;

    db.Nodes.update(
        {
            name,
            description,
            coordinate,
            address, instalationDate
        },
        { where: { nodeId: req.params.id } }
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
};

export const getUsersHaveSubscribed: ControllerType = async (req, res, next) => {
    const { page, limit, search, offset } = parseQueries(req, {
        sortOpt: ['UsersSubscriptions.createdAt', 'name', 'createdAt'],
    });

    const nodeId = req.params.id

    try {
        const node = await db.Nodes.findByPk(nodeId)

        if (!node) {
            return res.json({
                success: false,
                message: 'Node tidak ditemukan',
            });
        }

        const users = await node.getUserSubscriptions({
            where: { ...search },
            attributes: [
                'userId', 'name', 'phone', 'role', 'profilePicture',
                [db.sequelize.col('UsersSubscriptions.createdAt'), 'joinedAt'],
                [db.sequelize.col('UsersSubscriptions.usersSubscriptionId'), 'subscriptionId']
            ],
            joinTableAttributes: [],
            order: [[db.sequelize.col('joinedAt'), 'DESC']],
            offset,
            limit,
        })

        const count = await node.countUserSubscriptions({ where: { ...search } })

        res.json({
            success: true,
            totalItems: count,
            currentPage: page,
            pageSize: limit,
            result: users,
        });
    } catch (error) { next(error) }
};

export const deleteUsersSubscription: ControllerType = async (req, res, next) => {
    const nodeId = req.params.id
    const usersSubscriptionId = req.query.subscriptionid as string
    const deleteAll = req.query.all as string === 'true'


    if (!usersSubscriptionId && !deleteAll) {
        return res.json({
            success: false,
            message: 'Input invalid'
        })
    }

    try {
        const affected = await db.UsersSubscription
            .destroy({
                where: deleteAll ? { nodeId } : { usersSubscriptionId }
            })

        return res.json({
            success: Boolean(affected),
            message: affected ? 'Keanggotaan berhasil dihapus' : 'Opss!, Ada yang salah, keanggotaan gagal dihapus'
        })

    } catch (error) { next(error) }
};

export const getCompaniesHaveSubscribed: ControllerType = async (req, res, next) => {
    const { page, limit, search, offset } = parseQueries(req, {
        sortOpt: ['CompanySubscriptions.createdAt', 'name', 'createdAt'],
    });

    const nodeId = req.params.id

    try {
        const node = await db.Nodes.findByPk(nodeId)

        if (!node) {
            return res.json({
                success: false,
                message: 'Node tidak ditemukan',
            });
        }

        const users = await node.getCompanySubscriptions({
            where: { ...search },
            attributes: [
                'companyId', 'name', 'type',
                [db.sequelize.col('CompanySubscriptions.createdAt'), 'joinedAt'],
                [db.sequelize.col('CompanySubscriptions.companySubscriptionId'), 'subscriptionId']
            ],
            joinTableAttributes: [],
            order: [[db.sequelize.col('joinedAt'), 'DESC']],
            offset,
            limit,
        })

        const count = await node.countCompanySubscriptions({ where: { ...search } })

        res.json({
            success: true,
            totalItems: count,
            currentPage: page,
            pageSize: limit,
            result: users,
        });
    } catch (error) { next(error) }
};


export const deleteCompanySubscription: ControllerType = async (req, res, next) => {
    const nodeId = req.params.id
    const companySubscriptionId = req.query.subscriptionid as string
    const deleteAll = req.query.all as string === 'true'


    if (!companySubscriptionId && !deleteAll) {
        return res.json({
            success: false,
            message: 'Input invalid'
        })
    }

    try {
        const affected = await db.CompanySubscription
            .destroy({
                where: deleteAll ? { nodeId } : { companySubscriptionId }
            })

        return res.json({
            success: Boolean(affected),
            message: affected ? 'Keanggotaan berhasil dihapus' : 'Opss!, Ada yang salah, keanggotaan gagal dihapus'
        })

    } catch (error) { next(error) }
};


export const getDatalogs: ControllerType = async (req, res, next) => {
    const { start, end } = req.query as QueryOfSting
    const nodeId = req.params.id


    const startDate = new Date(start)
    const endDate = new Date(end)


    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({
            success: false,
            message: 'Rentang waktu tidak valid'
        });
    }



    const datalogs = await db.Nodes.findByPk(nodeId, {
        attributes: ['nodeId', 'name', 'status', 'lastDataSent'],
        include: [{
            model: db.DataLogs,
            where: {
                datetime: { [Op.between]: [startDate, endDate] }
            },
            required: false
        }],
    })


    if (!datalogs) {
        return res.json({
            success: false,
            message: 'Node tidak ditemukan',
        });
    }

    res.json({
        success: true,
        startDate, endDate,
        result: datalogs
    })
};



export const getAvailableNode: ControllerType = (req, res, next) => {
    const { page, limit, search, order, offset } = parseQueries(req, {
        sortOpt: ['createdAt', 'name', 'type'],
    });

    const withCompanySubs = parseInt(req.query.forCompanySubs as string);
    const withUserSubs = parseInt(req.query.forUserSubs as string);

    let isSubscribedQuery: ProjectionAlias[] = [];

    if (withUserSubs) isSubscribedQuery = [[
        db.sequelize.literal(`(
            SELECT COUNT(*) FROM userssubscriptions
            WHERE userssubscriptions.nodeId = Nodes.nodeId
            AND userssubscriptions.userId = ${withUserSubs || 'null'}
        )`),
        'isSubscribed',
    ]];

    if (withCompanySubs) isSubscribedQuery = [[
        db.sequelize.literal(`(
            SELECT COUNT(*) FROM companysubscriptions
            WHERE companysubscriptions.nodeId = Nodes.nodeId
            AND companysubscriptions.companyId = ${withCompanySubs || 'null'}
        )`),
        'isSubscribed',
    ]];

    if (isSubscribedQuery.length) order.unshift([db.sequelize.literal('isSubscribed'), 'ASC']);

    db.Nodes.findAndCountAll({
        attributes: [
            'nodeId',
            'name',
            'coordinate',
            'status',
            'createdAt',
            'companyId',
            ...isSubscribedQuery
        ],
        where: { ...search }
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
        .catch(next);
};

export const toggleNodeStatus: ControllerType = async (req, res, next) => {
    const { nodeId } = req.body

    if (!nodeId) return res.status(400).send("bad request")

    try {
        const node = await db.Nodes.findOne({
            attributes: ['nodeId', 'status'],
            where: { nodeId }
        })
        if (!node) return res.status(404).send("Node tidak ditemukan ")

        node.status = node.status === 'nonactive' ? 'active' : 'nonactive'

        await node.save()
        res.json({
            success: true,
            result: {
                status: node.status
            }
        })

    } catch (error) { next(error) }
}


export const downloadableNode: ControllerType = async (req, res, next) => {
    const { page, limit, search: searchByName, order, offset } = parseQueries(req);
    const { role, userId } = req.user

    try {
        if (role === 'regular') {
            const { count, rows: nodes } = await db.Nodes.findAndCountAll({
                attributes: ['nodeId', 'name'],
                include: [
                    {
                        model: db.Users,
                        as: 'userSubscriptions',
                        attributes: [],
                        required: false,
                        where: { userId }
                    }
                ],
                where: {
                    ...searchByName,
                    '$userSubscriptions.userId$': userId
                },
            })


            res.json({
                success: true,
                totalItems: count,
                currentPage: page,
                pageSize: limit,
                result: nodes.map(({ nodeId, name }) => ({ nodeId, name }))
            });
        }

        if (role == 'manager') {
            const companyIds = (await req.user.getCompanies({ attributes: ['companyId'] })).map(e => e.companyId);

            const { count, rows: nodes } = await db.Nodes.findAndCountAll({
                attributes: ['nodeId', 'name'],
                include: [
                    {
                        model: db.Companies,
                        attributes: ['name'],
                        through: { attributes: [] },
                        where: { companyId: { [Op.in]: companyIds } },
                        as: 'companySubscriptions',
                        required: false,
                    },
                ],
                where: {
                    ...searchByName,
                    [Op.or]: [
                        { companyId: { [Op.in]: companyIds } },
                        { '$companySubscriptions.companyId$': { [Op.in]: companyIds } },
                    ]
                },
            });

            res.json({
                success: true,
                totalItems: count,
                currentPage: page,
                pageSize: limit,
                result: nodes.map(({ nodeId, name }) => ({ nodeId, name }))
            });
        }

        const { count, rows: nodes } = await db.Nodes.findAndCountAll({
            attributes: ['nodeId', 'name'],
            where: { ...searchByName },
        });

        res.json({
            success: true,
            totalItems: count,
            currentPage: page,
            pageSize: limit,
            result: nodes.map(({ nodeId, name }) => ({ nodeId, name }))
        });

    } catch (error) { next(error); }
}