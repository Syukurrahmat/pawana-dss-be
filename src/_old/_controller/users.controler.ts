import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../_models/index.js';
import { ControllerType, Pagination, QueryOfSting } from '../_types/index.js';
import { parseQueries, myBcriptSalt } from '../../lib/common.utils.js';
import { Op } from 'sequelize';
import Randomstring from 'randomstring';
import sendVerificationEmail from '../../lib/email/sendEmail.utils.js';
import { SUBS_LIMIT } from '../constants/server.js';
import moment from 'moment';


//  ======================= api/users =======================

export const getAllUse2rs = (pagination : Pagination) => {
    const { page, limit, search, order, offset } = pagination
}



export const getAllUsers: ControllerType = async (req, res, next) => {
    const { page, limit, search, order, offset } = parseQueries(req);

    console.log(req.pagination!)
    
    const unverified = req.query.unverified as string == 'true'
    const role = req.query.role as string

    const roleObj = role ? { role } : {}

    try {
        const { count, rows: users } = await db.Users.findAndCountAll({
            attributes: ['userId', 'name', 'phone', 'profilePicture', 'email', 'role', 'createdAt'],
            where: { isVerified: !unverified, ...roleObj, ...search },
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

    } catch (e) { next(e) }
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
    const { name, email, phone, description, address, profilePicture, role } = req.body;

    try {
        const emailAlreadyUsed = await db.Users.count({ where: { email } })

        if (emailAlreadyUsed) {
            return res.json({
                success: false,
                message: 'Alamat Surel Telah digunakan untuk pengguna lain'
            })
        }

        const token = jwt.sign({ email }, process.env.JWT_SECRETKEY!, { expiresIn: '3d' });
        await sendVerificationEmail(name, email, token)

        const password = Randomstring.generate(12)

        const newUser = await db.Users.create({
            name, email, phone, description, address,
            profilePicture, password, role
        })

        if (!newUser) return next()


        res.json({
            success: true,
            message: 'Pengguna berhasil ditambahkan '
        })


    } catch (error) { next(error) }
}

//  ===================== api/users/:id =====================

export const getUser: ControllerType = async (req, res, next) => {
    const { id: userId } = req.params

    try {
        const user = await db.Users.findOne({
            where: { userId, isVerified: true },
            attributes: { exclude: ['createdAt', 'updatedAt', 'password'] },
        })

        if (!user) return res.status(404).json({
            success: false,
            message: 'user tidak ditemukan',
        });

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

export const editUserPassword: ControllerType = async (req, res, next) => {
    const { id: userId } = req.params
    const { password, newPassword } = req.body;

    if (!password && !newPassword) return res.status(400).send("bad request")

    if (!bcrypt.compareSync(password, req.user!.password)) return res.json({
        success: false,
        message: 'Kata sandi tidak tepat',
    });

    db.Users.update({ password: newPassword }, { where: { userId } })
        .then(([n]) => {
            res.json({
                success: Boolean(n),
                message: n ? 'Kata Sandi berhasil diperbarui' : 'Kata Sandi gagal diperbarui',
            });
        })
        .catch(next);
}


export const editUserProfile: ControllerType = async (req, res, next) => {
    const { id: userId } = req.params
    const { name, phone, description, address, profilePicture } = req.body;

    db.Users.update(
        {
            name,
            phone,
            description,
            address,
            profilePicture,
        },
        { where: { userId } }
    )
        .then(([n]) => {
            res.json({
                success: Boolean(n),
                message: n ? 'Berhasil diperbarui' : 'Gagal diperbarui',
            });
        })
        .catch(() => {
            res.json({
                success: false,
                message: 'Gagal diperbarui',
            });
        });
};

//  ===================== api/users/:id/nodes =====================

export const getSubscribedNodes: ControllerType = async (req, res, next) => {
    const { page, limit, search, order, offset } = parseQueries(req, {
        sortOpt: ['name', 'createdAt'],
    });

    const { id: userId } = req.params

    try {
        const user = await db.Users.findOne({ attributes: ['userId'], where: { userId } })

        if (!user) return res.status(404).json({
            success: false,
            message: 'User tidak ditemukan',
        });


        const nodes = await user.getSubscribedNodes({
            attributes: [
                'nodeId', 'name', 'coordinate', 'lastDataSent', 'isUptodate',
                [db.sequelize.col('UsersSubscriptions.createdAt'), 'joinedAt'],
                [db.sequelize.col('UsersSubscriptions.usersSubscriptionId'), 'subscriptionId']
            ],
            joinTableAttributes: [],
            where: { ...search },
            offset,
            limit,
            order: [[db.sequelize.col('joinedAt'), 'DESC']],
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
        .then(n => {
            return res.json({
                success: Boolean(n),
                message: n
                    ? 'Keanggotaan berhasil dihapus'
                    : 'Opss!, Ada yang salah, keanggotaan gagal dihapus'
            })
        }).catch(next)
};


export const addNodeSubscription: ControllerType = async (req, res, next) => {
    const { id: userId } = req.params;
    const nodeIds = req.body.nodeIds

    if (!(Array.isArray(nodeIds) && nodeIds.length)) return res.status(400)

    const user = await db.Users.findOne({ where: { userId }, attributes: ['userId'] });

    if (!user) return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan',
    });

    const countSubscribed = await user.countSubscribedNodes()

    if (countSubscribed >= SUBS_LIMIT) return res.status(404).json({
        success: false,
        message: 'Melebih batas yang diizinkan',
    });

    const nodes = await db.Nodes.findAll({
        where: { nodeId: { [Op.in]: nodeIds.filter((e) => e) } },
        attributes: ['nodeId'],
    });

    await user.addSubscribedNodes(nodes.slice(0, SUBS_LIMIT - countSubscribed))

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

    const { id: userId } = req.params;

    try {
        const user = await db.Users.findOne({ where: { userId } })

        if (!user) return res.status(404).json({
            success: false,
            message: 'User tidak ditemukan',
        });


        const companies = await user.getCompanies({
            attributes: ['companyId', 'name', 'type', 'createdAt', 'coordinate'],
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


export const getRemainingSubsLimit: ControllerType = async (req, res, next) => {
    res.json({ success: true, result: SUBS_LIMIT - await req.user!.countSubscribedNodes() });
};


export const getOwnNodes: ControllerType = async (req, res, next) => {
    const { id: userId } = req.params

    try {
        const companyIds = await db.Companies
            .findAll({ attributes: ['companyId'], where: { managedBy: userId } })
            .then(e => e.map(f => f.companyId!))

        const nodes = await db.Nodes.findAll({
            attributes: ['nodeId', 'isUptodate', 'name', 'createdAt', 'lastDataSent'],
            include: {
                model: db.Companies,
                as: 'owner',
                attributes: ['name', 'companyId', 'type'],
                where: { companyId: { [Op.in]: companyIds } },
                required: true,
            },
            order: [[{ model: db.Companies, as: 'owner' }, 'name', 'ASC']]
        })

        res.json({
            success: true,
            result: nodes
        });

    } catch (error) {
        next(error);
    }
};

export const getOwnNodesSummary: ControllerType = async (req, res, next) => {
    const sixHoursAgo = moment().subtract(6, 'hours').toDate();

    try {

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

        const filterByNodeIds = { nodeId: { [Op.in]: nodeIds } }


        const all = await db.Nodes.count({
            where: {
                ...filterByNodeIds
            }
        })


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

        const status = [
            { value: 'active', count: activeNodes },
            { value: 'nonactive', count: nonActiveNodes }
        ]

        res.json({
            success: true,
            result: {
                all,
                status
            }
        })

    } catch (error) {
        next(error)
    }
}