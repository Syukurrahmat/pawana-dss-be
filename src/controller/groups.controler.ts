import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../models/index.js';
import { controllerType } from '../types/index.js';
import { buildQuery, salt } from '../utils/utils.js';
import { group } from 'console';
import { Op } from 'sequelize';

const membersCount = `(
    SELECT COUNT(*) FROM users
    INNER JOIN grouppermissions ON users.userId = grouppermissions.userId
    WHERE grouppermissions.groupId = Groups.groupId
    AND grouppermissions.requestStatus = 'approved'
)`;

const memberRequestCount = `(
    SELECT COUNT(*) FROM users
    INNER JOIN grouppermissions ON users.userId = grouppermissions.userId
    WHERE grouppermissions.groupId = Groups.groupId
    AND grouppermissions.requestStatus = 'pending'
)`;

const nodesCount = `(
    SELECT COUNT(*) FROM nodes
    WHERE nodes.groupId = Groups.groupId
)`;

export const getAllGroups: controllerType = async (req, res, next) => {
    const { page, limit, search, order, offset } = buildQuery(req, {
        searchField: 'name',
        sortOpt: ['name', 'createdAt'],
    });

    db.Groups.findAndCountAll({
        attributes: {
            exclude: ['updatedAt', 'description'],
            include: [
                [db.sequelize.literal(membersCount), 'membersCount'],
                [db.sequelize.literal(nodesCount), 'nodeCount'],
                [db.sequelize.literal(memberRequestCount), 'memberRequestsCount'],
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
        offset,
        limit,
    })
        .then(({ count, rows: groups }) => {
            res.json({
                success: true,
                totalItems: count,
                currentPage: page,
                pageSize: limit,
                result: groups
                    .map((e) => e.toJSON())
                    .map(({ users, ...rest }) => ({ ...rest, manager: users[0] || {} })),
            });
        })
        .catch(next);
};

export const createNewGroup: controllerType = async (req, res, next) => {
    const { name, description, address } = req.body;

    db.Groups.create({ name, description, address })
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
};

export const editGroupProfile: controllerType = async (req, res, next) => {
    const { name, address, description, groupId } = req.body;

    db.Groups.update({ name, description, address }, { where: { groupId } })
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

export const getGroupProfileById: controllerType = async (req, res, next) => {
    db.Groups.findOne({
        where: { groupId: req.params.id },
        attributes: {
            include: [
                [db.sequelize.literal(membersCount), 'membersCount'],
                [db.sequelize.literal(nodesCount), 'nodeCount'],
                [db.sequelize.literal(memberRequestCount), 'memberRequestsCount'],
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
    })
        .then((group) => {
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
        })
        .catch(next);
};

export const getAllGroupMembers: controllerType = async (req, res, next) => {
    const { page, limit, search, order, offset } = buildQuery(req, {
        searchField: 'name',
        sortOpt: ['name', 'createdAt'],
    });

    const groupId = req.params.id;
    const status = (req.query.status as string) || 'approved';

    const filteringObj = {
        through: { where: { requestStatus: status } },
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
            joinTableAttributes: ['permission', 'joinedAt', 'requestStatus', 'requestJoinAt'],
            offset,
            order,
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
};

export const addGroupMembers: controllerType = async (req, res, next) => {
    const userIds: number[] = req.body.userIds;
    const groupId = req.params.id;

    const group = await db.Groups.findOne({ where: { groupId }, attributes: ['groupId'] });

    if (!group) {
        res.json({
            success: false,
            message: 'Grup tidak ditemukan',
        });
        return;
    }

    const users = await db.Users.findAll({
        where: { userId: { [Op.in]: userIds.filter((e) => e) } },
        attributes: ['userId'],
    });

    const userAdded = await group.addUsers(users, {
        through: {
            requestStatus: 'approved',
            joinedAt: Date.now(),
        },
    });

    res.json({
        success: true,
        message: 'Pengguna berhasil ditambahkan',
    });
};

export const getAllGroupNodes: controllerType = async (req, res, next) => {
    const { page, limit, search, order, offset } = buildQuery(req, {
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
            offset,
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
};
export const changeMemberStatus: controllerType = async (req, res, next) => {
    const userIds: number[] = req.body.userIds;
    const status: string = req.body.status;
    const groupId = req.params.id;

    if (!['approved', 'rejected', 'dismissed'].includes(status)) return next();

    console.log({
        requestStatus: status as any,
        joinedAt: new Date(Date.now()),
    });

    const [affectedCount] = await db.GroupPermissions.update(
        {
            requestStatus: status as any,
            joinedAt: new Date(Date.now()),
        },
        {
            where: {
                userId: { [Op.in]: userIds.filter((e) => e) },
                groupId,
            },
        }
    );

    console.log(affectedCount);
    res.json({
        success: Boolean(affectedCount),
        message:
            status == 'approved'
                ? (affectedCount > 1 ? affectedCount + ' p' : 'P') +
                  'engguna berhasil ditambahkan ke grup'
                : status == 'rejected'
                ? (affectedCount > 1 ? affectedCount + ' p' : 'P') +
                  'engguna berhasil ditolak untuk masuk ke grup'
                : (affectedCount > 1 ? affectedCount + ' p' : 'P') +
                  'engguna berhasil dikeluarkan dari grup',
    });
};
