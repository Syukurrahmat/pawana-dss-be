import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../models/index.js';
import { ControllerType } from '../types/index.js';
import { parseQueries, myBcriptSalt } from '../utils/utils.js';
import { Op } from 'sequelize';
import Randomstring from 'randomstring';


//  ======================= api/users =======================

export const getAllUsers: ControllerType = async (req, res, next) => {
    const { page, limit, search, order, offset } = parseQueries(req, {
        sortOpt: ['createdAt', 'name', 'role'],
    });

    const roleQuery = req.query.role as string

    const role = roleQuery ? { role: roleQuery } : {}
    const unverified = req.query.unverified as string === 'true'

    try {
        const { count, rows: users } = await db.Users.findAndCountAll({
            attributes: ['userId', 'name', 'phone', 'profilePicture', 'email', 'role', 'createdAt'],
            where: { isVerified: !unverified, ...role, ...search },
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

export const getUsersSummary: ControllerType = async (req, res, next) => {
    const all = await db.Users.count()

    const userTypeEnum = ['admin', 'gov', 'manager', 'regular']
    const countEachRole = await db.Users.findAll({
        attributes: [
            'role',
            [db.sequelize.fn('COUNT', db.sequelize.col('role')), 'count']
        ],
        where: { isVerified: true },
        raw: true,
        group: 'role',
    });

    const countRole = userTypeEnum.map(e => ({
        value: e,
        count: countEachRole.find(({ role }) => role == e)?.count || 0
    }))

    countRole.push({
        value: 'unverified',
        count: await db.Users.count({ where: { isVerified: false } })
    })

    res.json({
        success: true,
        result: { all, role: countRole }
    })
}

export const createNewUser: ControllerType = async (req, res, next) => {
    const { name, email, phone, description, address, profilePicture } = req.body;


    try {

        const emailAlreadyUsed = await db.Users.count({ where: { email } })

        if (emailAlreadyUsed) {
            return res.json({
                success: false,
                message: 'Alamat Surel Telah digunakan untuk pengguna lain'
            })
        }

        let password = Randomstring.generate(12)

        let newUser = await db.Users.create({
            name, email, phone, description, address, profilePicture, password
        })

        if (!newUser) return next()

        let token = jwt.sign({ email }, process.env.JWT_SECRETKEY, { expiresIn: '3d' });

        console.log(token)

        res.json({
            success: true,
            message: 'Pengguna berhasil ditambahkan '
        })


    } catch (error) {
        next(error)
    }
}

//  ===================== api/users/:id =====================

export const getUser: ControllerType = async (req, res, next) => {
    const userId = req.params.id

    try {

        const user = await db.Users.findOne({
            where: { userId, isVerified: true },
            attributes: { exclude: ['createdAt', 'updatedAt', 'password'] },
        })

        if (!user) {
            return res.json({
                success: false,
                message: 'user tidak ditemukan',
            });
        }

        const countSubscribedNodes = await user.countSubscribedNodes()
        const countManagedCompany = await user.countCompanies()

        res.json({
            success: true, result: {
                ...user.toJSON(),
                countSubscribedNodes,
                countManagedCompany
            }
        });


    } catch (error) { next(error) }
};

export const editUserProfile: ControllerType = async (req, res, next) => {
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
            password: isUpdatePassword ? bcrypt.hashSync(newPassword, myBcriptSalt) : undefined,
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

//  ===================== api/users/:id/nodes =====================

export const getSubscribedNodes: ControllerType = async (req, res, next) => {
    const { page, limit, search, order, offset } = parseQueries(req, {
        sortOpt: ['name', 'createdAt'],
    });

    const userId = req.params.id;

    try {
        const user = await db.Users.findOne({ where: { userId } })

        if (!user) {
            return res.json({
                success: false,
                message: 'User tidak ditemukan',
            });
        }

        const nodes = await user.getSubscribedNodes({
            attributes: ['nodeId', 'name', 'coordinate', 'status', 'lastDataSent',],
            where: { ...search },
            joinTableAttributes: ['usersSubscriptionId', 'createdAt'],
            offset,
            limit,
            order: [[db.sequelize.col('UsersSubscriptions.createdAt'), 'DESC']],

        })

        const count = await user.countSubscribedNodes({ where: { ...search } });


        res.json({
            success: true,
            totalItems: count,
            currentPage: page,
            pageSize: limit,
            result: nodes
        });

    } catch (error) {
        next(error);
    }
};


export const deleteNodeSubscription: ControllerType = async (req, res, next) => {
    const usersSubscriptionId = req.query.subscriptionid as string

    db.UsersSubscription.destroy({ where: { usersSubscriptionId } })
        .then(affected => {
            return res.json({
                success: Boolean(affected),
                message: affected ? 'Keanggotaan berhasil dihapus' : 'Opss!, Ada yang salah, keanggotaan gagal dihapus'
            })
        }).catch(next)
};

export const addNodeSubscription: ControllerType = async (req, res, next) => {
    const nodeIds: number[] = req.body.nodeIds;
    const userId = req.params.id;

    const user = await db.Users.findOne({ where: { userId }, attributes: ['userId'] });

    if (!user) {
        res.json({
            success: false,
            message: 'Pengguna tidak ditemukan',
        });
        return;
    }

    const nodes = await db.Nodes.findAll({
        where: { nodeId: { [Op.in]: nodeIds.filter((e) => e) } },
        attributes: ['nodeId'],
    });

    const userAdded = await user.addSubscribedNodes(nodes)

    console.log(userAdded);

    res.json({
        success: true,
        message: 'Node berhasil ditambahkan',
    });
};

//  ===================== api/users/:id/companies =====================

export const getManagedCompanies: ControllerType = async (req, res, next) => {
    const { page, limit, search, order, offset } = parseQueries(req, {
        sortOpt: ['name', 'createdAt'],
    });

    const userId = req.params.id;

    try {
        const user = await db.Users.findOne({ where: { userId } })

        if (!user) {
            return res.json({
                success: false,
                message: 'User tidak ditemukan',
            });
        }

        const companies = await user.getCompanies({
            attributes: ['companyId', 'name', 'type', 'createdAt',],
            where: { ...search },
            offset,
            limit,
        })

        const count = await user.countCompanies();

        res.json({
            success: true,
            totalItems: count,
            currentPage: page,
            pageSize: limit,
            result: companies
        });

    } catch (error) {
        next(error);
    }
};
