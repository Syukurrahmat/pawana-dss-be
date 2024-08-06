import { Op } from 'sequelize';
import db from '../models/index.js';
import { ControllerType } from '../types/index.js';
import { parseQueries } from '../utils/common.utils.js';
import { SUBS_LIMIT } from '../constants/server.js'

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


export const createNewCompany: ControllerType = async (req, res, next) => {
    const { name, description, address, type, managerId: managedBy, coordinate } = req.body;

    db.Companies.create({ name, description, address, type, coordinate, managedBy })
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

    try {

        const company = (await db.Companies.findOne({
            where: { companyId },
            include: {
                model: db.Users,
                attributes: ['name', 'userId', 'phone', 'profilePicture', 'email'],
            },
        }))!

        const countSubscribedNodes = await company.countSubscribedNodes()

        res.json({
            success: true, result: {
                ...company.toJSON(),
                countSubscribedNodes,
            }
        });

    } catch (error) { next(error) }

};


export const editCompanyProfile: ControllerType = async (req, res, next) => {
    const companyId = req.params.id;
    const { name, address, description, coordinate } = req.body;

    db.Companies
        .update({ name, description, address, coordinate }, { where: { companyId } })
        .then(([n]) => {
            res.json({
                success: Boolean(n),
                message: n ? 'Berhasil diperbarui' : 'Gagal diperbarui',
            });
        })
        .catch(next);
};


//  =================================================

export const getAllSubscribedNode: ControllerType = async (req, res, next) => {
    const { id: companyId } = req.params

    const { page, limit, search, order, offset } = parseQueries(req);


    try {

        const nodes = await req.company!.getSubscribedNodes({
            where: { ...search },
            attributes: [
                'nodeId', 'name', 'coordinate', 'isUptodate', 'lastDataSent',
                [db.sequelize.col('CompanySubscriptions.createdAt'), 'joinedAt'],
                [db.sequelize.col('CompanySubscriptions.companySubscriptionId'), 'subscriptionId']
            ],
            joinTableAttributes: [],
            order: [[db.sequelize.col('joinedAt'), 'DESC']],
            offset,
            limit,
        });

        const count = await req.company!.countSubscribedNodes({ where: { ...search } });

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

export const addNodeSubscription: ControllerType = async (req, res, next) => {
    const nodeIds = req.body.nodeIds
    if (!(Array.isArray(nodeIds) && nodeIds.length)) return res.status(400)

    const countSubscribed = await req.company!.countSubscribedNodes()

    if (countSubscribed >= SUBS_LIMIT) return res.status(404).json({
        success: false,
        message: 'Melebih batas yang diizinkan',
    });


    const nodes = await db.Nodes.findAll({
        where: { nodeId: { [Op.in]: nodeIds.filter((e) => e) } },
        attributes: ['nodeId'],
    });

    await req.company!.addSubscribedNodes(nodes.slice(0, SUBS_LIMIT - countSubscribed))

    res.json({
        success: true,
        message: 'Node berhasil ditambahkan',
    });

}

export const deleteNodeSubscription: ControllerType = async (req, res, next) => {
    const companySubscriptionId = req.query.subscriptionid as string

    db.CompanySubscription.destroy({ where: { companySubscriptionId } })
        .then(affected => {
            return res.json({
                success: Boolean(affected),
                message: affected ? 'Keanggotaan berhasil dihapus' : 'Opss!, Ada yang salah, keanggotaan gagal dihapus'
            })
        }).catch(next)
};

//  =================================================

export const getAllPrivateNode: ControllerType = async (req, res, next) => {
    const { id: companyId } = req.params
    const { page, limit, search, order, offset } = parseQueries(req);


    try {
        const company = await db.Companies.findByPk(companyId);

        if (!company) {
            res.json({
                success: false,
                message: 'Grup tidak ditemukan',
            });
            return;
        }

        const nodes = await company.getPrivateNodes({
            where: { ...search },
            attributes: [
                'nodeId', 'name', 'coordinate', 'isUptodate', 'lastDataSent', 'createdAt',
            ],
            order: [['createdAt', 'DESC']],
            offset,
            limit,
        });

        const count = await company.countPrivateNodes({ where: { ...search } });

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





}




export const getRemainingSubsLimit: ControllerType = async (req, res, next) => {
    res.json({ success: true, result: SUBS_LIMIT - await req.company!.countSubscribedNodes() });
};