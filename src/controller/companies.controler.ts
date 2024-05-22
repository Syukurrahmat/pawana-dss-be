import db from '../models/index.js';
import { ControllerType } from '../types/index.js';
import { parseQueries, myBcriptSalt } from '../utils/utils.js';


export const getCompaniesSummary: ControllerType = async (req, res, next) => {
    const all = await db.Companies.count()

    const companyTypeEnum = ['tofufactory', 'service', 'agriculture', 'retailstore', 'restaurant', 'other']
    const countEachType = await db.Companies.findAll({
        attributes: [
            'type',
            [db.sequelize.fn('COUNT', db.sequelize.col('type')), 'count']
        ],
        group: 'type',
        raw: true
    });

    const type = companyTypeEnum.map(e => ({
        value: e,
        count: countEachType.find(({ type }) => type == e)?.count || 0
    }))

    res.json({
        success: true,
        result: { all, type }
    })
}
export const getAllCompanies: ControllerType = async (req, res, next) => {
    const { page, limit, search, order, offset } = parseQueries(req, {
        sortOpt: ['name', 'createdAt'],
    });

    const all = req.query.all as string == 'true'
    const paginationObj = all ? {} : { order, offset, limit }

    db.Companies.findAndCountAll({
        attributes: {
            exclude: ['updatedAt', 'description'],
        },
        include: {
            model: db.Users,
            attributes: ['userId', 'name', 'profilePicture']
        },
        where: { ...search },
        ...paginationObj
    })
        .then(({ count, rows: groups }) => {
            res.json({
                success: true,
                totalItems: count,
                currentPage: page,
                pageSize: all ? Infinity : limit,
                result: groups,
            });
        })
        .catch(next);
};


export const createNewCompany: ControllerType = async (req, res, next) => {
    const { name, description, address, type, managerId } = req.body;

    db.Companies.create({ name, description, address, type, managedBy: managerId })
        .then((company) => {
            res.json({
                success: true,
                message: 'Grup berhasil dibuat',
                result: {
                    companyId: company.companyId,
                },
            });
        })
        .catch(next);
};


export const getCompanyById: ControllerType = async (req, res, next) => {
    const { id: companyId } = req.params

    db.Companies.findOne({
        where: { companyId },
        include: {
            model: db.Users,
            attributes: ['name', 'userId', 'phone', 'profilePicture', 'email'],
        },
    })
        .then((group) => {
            if (!group) {
                return res.json({
                    success: false,
                    message: 'Grup tidak ditemukan',
                });
            }

            res.json({
                success: true,
                result: group,
            });
        })
        .catch(next);
};


export const editCompanyProfile: ControllerType = async (req, res, next) => {
    const companyId = req.params.id;
    const { name, address, description } = req.body;


    db.Companies
        .update({ name, description, address }, { where: { companyId } })
        .then(([n]) => {
            res.json({
                success: Boolean(n),
                message: n ? 'Berhasil diperbarui' : 'Gagal diperbarui',
            });
        })
        .catch(next);
};

export const getAllGroupNodes: ControllerType = async (req, res, next) => {
    const { page, limit, search, order, offset } = parseQueries(req, {
        sortOpt: ['name', 'timestamp'],
    });

    const companyId = req.params.id;

    try {
        const company = await db.Companies.findOne({ where: { companyId } });

        if (!company) {
            res.json({
                success: false,
                message: 'Grup tidak ditemukan',
            });
            return;
        }

        const nodes = await company.getSubscribedNodes({
            where: { ...search },
            attributes: ['nodeId', 'name', 'coordinate', 'status',],
            joinTableAttributes: ['companySubscriptionId', 'createdAt'],
            order: [[db.sequelize.col('CompanySubscriptions.createdAt'), 'DESC']],
            offset,
            limit,
        });

        const count = await company.countSubscribedNodes({ where: { ...search } });

        res.json({
            success: true,
            totalItems: count,
            currentPage: page,
            pageSize: limit,
            result: nodes,
        });
    } catch (error) {
        next(error);
    }
};
export const changeMemberStatus: ControllerType = async (req, res, next) => {
    const userIds: number[] = req.body.userIds;
    const status: string = req.body.status;
    const companyId = req.params.id;

    if (!['approved', 'rejected', 'dismissed'].includes(status)) return next();

    console.log({
        requestStatus: status as any,
        joinedAt: new Date(Date.now()),
    });

    // const [affectedCount] = await db.GroupPermissions.update(
    //     {
    //         requestStatus: status as any,
    //         joinedAt: new Date(Date.now()),
    //     },
    //     {
    //         where: {
    //             userId: { [Op.in]: userIds.filter((e) => e) },
    //             companyId,
    //         },
    //     }
    // );

    let affectedCount = 1
    // console.log(affectedCount);
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
