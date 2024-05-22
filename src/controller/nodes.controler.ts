import { Op } from 'sequelize';
import db from '../models/index.js';
import { ControllerType } from '../types/index.js';
import { parseQueries } from '../utils/utils.js';
import { v4 as uuidV4 } from 'uuid';


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
        const publicNodes = await db.Nodes.count({ where: { ownerId: { [Op.is]: null } } });
        const privateNodes = await db.Nodes.count({ where: { ownerId: { [Op.not]: null } } });

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
    const { name, description, address, status, latitude, longitude, instalationDate } = req.body;


    db.Nodes.create({
        name, description, address, status,
        instalationDate,
        coordinate: [latitude, longitude],
        apiKey: uuidV4(),
    })
        .then((node) => {
            res.json({
                success: true,
                message: 'Node Berhasil dibuat',
                result: { nodeId: node.nodeId }
            });
        })
        .catch(next);
};

export const getNodeById: ControllerType = async (req, res, next) => {
    const nodeId = req.params.id

    const node = await db.Nodes.findByPk(nodeId, {
        include: {
            model: db.Users, as: 'owner', attributes: ['userId', 'name', 'phone', 'profilePicture']
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
    const { name, description, coordinate } = req.body;

    db.Nodes.update(
        {
            name,
            description,
            coordinate,
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

export const getAllUsersSubscription: ControllerType = async (req, res, next) => {
    const { page, limit, search, offset } = parseQueries(req, {
        sortOpt: ['UsersSubscriptions.createdAt', 'name', 'createdAt'],
    });

    const nodeId = req.params.id

    const node = await db.Nodes.findByPk(nodeId)

    if (!node) {
        return res.json({
            success: false,
            message: 'Node tidak ditemukan',
        });
    }

    const users = await node.getUserSubscriptions({
        where: { ...search },
        attributes: ['userId', 'name', 'phone', 'role', 'profilePicture',],
        joinTableAttributes: ['usersSubscriptionId', 'createdAt'],
        order: [[db.sequelize.col('UsersSubscriptions.createdAt'), 'DESC']],
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
};

export const deleteUsersSubscription: ControllerType = async (req, res, next) => {
    const userIds = req.body.userIds as string[]

    const nodeId = req.params.id

    const node = await db.Nodes.findByPk(nodeId)

    if (!node) {
        return res.json({
            success: false,
            message: 'Node tidak ditemukan',
        });
    }

    // const users = await node.getUserSubscriptions({
    //     where: { ...search },
    //     attributes: ['userId', 'name', 'phone', 'role', 'profilePicture',],
    //     joinTableAttributes: ['usersSubscriptionId', 'createdAt'],
    //     order: [[db.sequelize.col('UsersSubscriptions.createdAt'), 'DESC']],
    //     offset,
    //     limit,
    // })

    // const count = await node.countUserSubscriptions({ where: { ...search } })

    // res.json({
    //     success: true,
    //     totalItems: count,
    //     currentPage: page,
    //     pageSize: limit,
    //     result: users,
    // });
};
