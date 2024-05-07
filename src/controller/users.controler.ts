import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../models/index.js';
import { controllerType } from '../types/index.js';
import { parseQueries, salt } from '../utils/utils.js';
import { Op } from 'sequelize';

export const getAllUsers: controllerType = async (req, res, next) => {
    const { page, limit, search, order, offset } = parseQueries(req, {
        searchField: 'name',
        sortOpt: ['name', 'role', 'createdAt'],
    });

    try {
        const { count, rows: users } = await db.Users.findAndCountAll({
            attributes: ['userId', 'name', 'phone', 'profilePicture', 'email', 'createdAt'],
            where: { isVerified: true, ...search },
            offset,
            order,
            limit,
        });

        res.json({
            success: true,
            totalItems: count,
            currentPage: page,
            pageSize: limit,
            result: users.map((e) => e.toJSON()),
        });
    } catch (e) {
        next(e);
    }
};

export const editUserProfile: controllerType = async (req, res, next) => {
    const { name, phone, description, address, profilePicture } = req.body;
    const { password, newPassword } = req.body;

    const userId = req.params.id;

    console.log({
        name,
        phone,
        description,
        address,
        profilePicture,
        password,
        newPassword,
        userId,
    });

    const isUpdatePassword = password && newPassword;

    if (isUpdatePassword) {
        try {
            const user = await db.Users.findOne({
                where: { userId },
                attributes: ['password'],
            });

            if (!bcrypt.compareSync(password, user.password)) {
                res.json({
                    success: false,
                    message: 'Kata sandi tidak tepat',
                });
                return;
            }
        } catch (error) {
            next(error);
        }
    }

    db.Users.update(
        {
            name,
            phone,
            description,
            address,
            profilePicture,
            password: isUpdatePassword ? bcrypt.hashSync(newPassword, salt) : undefined,
        },
        { where: { userId } }
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

export const getUserProfileById: controllerType = async (req, res, next) => {
    try {
        const user = await db.Users.findOne({
            where: { userId: req.params.id, isVerified: true },
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'password'],
            },
        });

        if (!user) {
            res.json({
                success: false,
                message: 'user tidak ditemukan',
            });
            return;
        }

        const groupCount = await user.countGroups({
            //@ts-ignore
            through: { where: { requestStatus: 'approved' } },
        });
        const requestGroupCount = await user.countGroups({
            //@ts-ignore
            through: { where: { requestStatus: { [Op.in]: ['pending', 'rejected'] } } },
        });

        res.json({ success: true, result: { ...user.toJSON(), groupCount, requestGroupCount } });
    } catch (error) {
        next(error);
    }
};

export const getAllMemberSubscription: controllerType = async (req, res, next) => {
    const { page, limit, search, order, offset } = parseQueries(req, {
        searchField: 'name',
        sortOpt: ['name', 'createdAt'],
    });

    const onlyApproved = (req.query['not-approved'] as string) !== 'true';

    const userId = req.params.id;

    try {
        const user = await db.Users.findOne({ where: { userId } });

        if (!user) {
            res.json({
                success: false,
                message: 'User tidak ditemukan',
            });
            return;
        }

        const groups = await user.getGroups({
            where: { ...search },
            attributes: ['groupId', 'name'],
            //@ts-ignore
            through: {
                where: {
                    requestStatus: onlyApproved ? 'approved' : { [Op.not]: 'approved' },
                },
            },
            joinTableAttributes: ['permission', 'joinedAt', 'requestJoinAt', 'requestStatus'],
            order,
            offset,
            limit,
        });

        const count = await user.countGroups({
            where: {
                ...search,
            },
            //@ts-ignore
            through: {
                where: {
                    requestStatus: onlyApproved ? 'approved' : { [Op.not]: 'approved' },
                },
            },
        });

        res.json({
            success: true,
            totalItems: count,
            currentPage: page,
            pageSize: limit,
            result: groups.map((f) => f.toJSON()),
        });
    } catch (error) {
        next(error);
    }
};

export const addGroupSubscription: controllerType = async (req, res, next) => {
    const groupIds: number[] = req.body.groupIds;
    const userId = req.params.id;

    const user = await db.Users.findOne({ where: { userId }, attributes: ['userId'] });

    if (!user) {
        res.json({
            success: false,
            message: 'Pengguna tidak ditemukan',
        });
        return;
    }

    const groups = await db.Groups.findAll({
        where: { groupId: { [Op.in]: groupIds.filter((e) => e) } },
        attributes: ['groupId'],
    });

    const userAdded = await user.addGroups(groups).then((e) => console.log(e));

    console.log(userAdded);

    res.json({
        success: true,
        message: 'Pengguna berhasil ditambahkan',
    });
};

export const getUsersWithSubsStatusInGroup: controllerType = async (req, res, next) => {
    const { page, limit, search, order, offset } = parseQueries(req, {
        searchField: 'name',
        sortOpt: ['name', 'createdAt'],
    });

    console.log({ page, limit, search, order, offset });

    const groupId = req.query['is-in-group'];

    try {
        const { count, rows: users } = await db.Users.findAndCountAll({
            attributes: [
                'userId',
                'profilePicture',
                'name',
                [
                    db.sequelize.literal(`(
                        SELECT COUNT(*) FROM grouppermissions
                        WHERE grouppermissions.userId = Users.userId
                        AND grouppermissions.requestStatus = "approved"
                        AND grouppermissions.groupId = ${groupId}
                    )`),
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

export const deleteGroupSubscription: controllerType = async (req, res, next) => {
    const groupId = req.body.groupId;
    const userId = req.params.id;

    const user = await db.Users.findOne({ where: { userId }, attributes: ['userId'] });

    if (!user) {
        res.json({
            success: false,
            message: 'Pengguna tidak ditemukan',
        });
        return;
    }

    const group = await user.getGroups({ where: { groupId } });

    if (!group) {
        res.json({
            success: false,
            message: 'Grup tidak ditemukan',
        });
        return;
    }

    let g = await user.removeGroup(group[0]);

    console.log(g);

    res.end();
};
