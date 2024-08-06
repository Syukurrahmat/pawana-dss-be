import { Op, ProjectionAlias, WhereOptions } from 'sequelize';
import { v4 as uuidV4 } from 'uuid';
import db from '../models/index.js';
import { ControllerType, QueryOfSting } from '../types/index.js';
import { parseQueries } from '../utils/common.utils.js';
import moment from 'moment';


/**
 * Mendapatkan semua Node
 */
export const getAllNodes: ControllerType = async (req, res, next) => {
    const { page, limit, search, order, offset } = parseQueries(req, {
        sortOpt: ['name', 'createdAt'],
    });

    const { all, ownship } = req.query as QueryOfSting
    const paginationObj = all == 'true' ? {} : { order, offset, limit }

    const filterByOwnship: any = {}


    switch (ownship) {
        case 'public':
            filterByOwnship.companyId = { [Op.is]: null }
            break;
        case 'private':
            filterByOwnship.companyId = { [Op.not]: null }
            break;
    }

    try {
        const { count, rows } = await db.Nodes.findAndCountAll({
            attributes: { exclude: ['instalationDate', 'description', 'apiKey', 'updatedAt'] },
            where: {
                ...search,
                ...filterByOwnship
            },
            ...paginationObj,
            include: {
                model: db.Companies,
                as: 'owner',
                attributes: ['name', 'companyId', 'type']
            },
            order: [[{ model: db.Companies, as: 'owner' }, 'name', 'ASC']]
        })

        res.json({
            success: true,
            totalItems: count,
            currentPage: page,
            pageSize: all ? Infinity : limit,
            result: rows,
        });
    } catch (error) {
        next(error)
    }
};

/**
 * Mendapatkan Laporan Jumlah Nodes
 */
export const getNodesSummary: ControllerType = async (req, res, next) => {

    const isManager = req.user!.role == 'manager'
    const sixHoursAgo = moment().subtract(6, 'hours').toDate();

    let filterByNodeIds: WhereOptions = {}

    try {

        if (isManager) {
            const nodeIds = await req.user!.getCompanies({
                include: {
                    model: db.Nodes,
                    as: 'privateNodes',
                    attributes: ['nodeId']
                }
            })
                .then(companies => (
                    companies.map(company => company.privateNodes?.map(e => e.nodeId!)!).flatMap(e => e))
                )

            filterByNodeIds = { nodeId: { [Op.in]: nodeIds } }
        }



        const all = await db.Nodes.count({
            where: {
                ...filterByNodeIds
            }
        })
        const publicNodes = await db.Nodes.count({
            where: {
                companyId: { [Op.is]: null },
                ...filterByNodeIds
            }
        });

        const privateNodes = await db.Nodes.count({
            where: {
                companyId: { [Op.not]: null },
                ...filterByNodeIds
            }
        });

        const activeNodes = await db.Nodes.count({
            where: {
                lastDataSent: { [Op.gte]: sixHoursAgo },
                ...filterByNodeIds
            }
        })
        const nonActiveNodes = await db.Nodes.count({
            where: {
                lastDataSent: { [Op.lt]: new Date() },
                ...filterByNodeIds
            }
        })

        const ownership = [
            { value: 'public', count: publicNodes },
            { value: 'private', count: privateNodes }
        ]

        const status = [
            { value: 'active', count: activeNodes },
            { value: 'nonactive', count: nonActiveNodes }
        ]

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
    let { name, description, address, coordinate, instalationDate, companyId } = req.body;

    const apiKey = uuidV4()
    const company = companyId ? await db.Companies.findByPk(companyId) : null

    instalationDate = moment(instalationDate).isValid() ? moment(instalationDate).format('YYYY-MM-DD') : undefined

    if (company) {
        address = company.address
        coordinate = company.coordinate
    }

    try {
        const newNode = await db.Nodes.create({
            companyId : company ? company.companyId : undefined,
            address,
            coordinate,
            name,
            description,
            instalationDate,
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
        include: [
            {
                model: db.Companies, as: 'owner', attributes: ['companyId', 'name', 'type']
            },
        ],
    })

    if (!node) {
        return res.json({
            success: false,
            message: 'Node tidak ditemukan',
        });
    }

    if (node.lastDataSent) {
        node.dataValues.dataLogs = await node.getDataLogs({
            where: {
                datetime: {
                    [Op.between]: [moment(node.lastDataSent).subtract(1, 'days').toDate(), node.lastDataSent]
                }
            }
        })
    } else {
        node.dataValues.dataLogs = []
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
        attributes: ['nodeId', 'name', 'isUptodate', 'lastDataSent'],
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
            'isUptodate',
            'lastDataSent',
            'createdAt',
            'companyId',
            ...isSubscribedQuery
        ],
        where: { ...search, companyId: { [Op.is]: undefined } }
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


export const downloadableNode: ControllerType = async (req, res, next) => {
    const { page, limit, search: searchByName, order, offset } = parseQueries(req);
    const { role, userId } = req.user!

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
            const companyIds = (await req.user!.getCompanies({ attributes: ['companyId'] })).map(e => e.companyId!);

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



