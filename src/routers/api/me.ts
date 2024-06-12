import { Router } from 'express';
import { addNodeSubscription, createNewUser, deleteNodeSubscription, editUserProfile, getManagedCompanies, getSubscribedNodes, getAllUsers, getUser, getUsersSummary, editUserPassword } from '../../controller/users.controler.js'; //prettier-ignore
import db from '../../models/index.js';
import { parseQueries } from '../../utils/common.utils.js';
import { Op } from 'sequelize';

const meRouter = Router();


const companyAttr = ['companyId', 'coordinate', 'name', 'type']


import moment from 'moment-timezone';
import { QueryOfSting } from '../../types/index.js';


meRouter.get('/', async (req, res, next) => {
    const { password, address, description, ...rest } = req.user.toJSON()
    const { timezone } = req.query as QueryOfSting

    if (moment.tz.zone(timezone)) req.session.tz = timezone

    res.json({
        ...rest,
        countSubscribedNodes: await req.user.countSubscribedNodes(),
        countManagedCompany: await req.user.countCompanies(),
        activeDashboard: req.session.activeDashboard,
        activeCompany: req.session.activeCompany
    })
});

meRouter.get('/companies', async (req, res, next) => {
    const includeUserSubs = req.query.includeUserSubs == 'true'

    const result: any[] = await req.user.getCompanies({ attributes: companyAttr })
    if (includeUserSubs) result.push({ type: 'regular' })

    res.json({ success: true, result })
});

meRouter.get('/downloadable-nodes', async (req, res, next) => {
    const { page, limit, search: searchByName, order, offset } = parseQueries(req);

    try {
        const { userId } = req.user
        const companyIds = (await req.user.getCompanies({ attributes: ['companyId'] })).map(e => e.companyId);

        const { count, rows: nodes } = await db.Nodes.findAndCountAll({
            attributes: ['nodeId', 'name'],
            include: [
                {
                    model: db.Users,
                    as: 'userSubscriptions',
                    attributes: [],
                    required: false,
                    where: { userId }
                },
                {
                    model: db.Companies,
                    attributes: ['name'],
                    through: { attributes: [] },
                    where: { companyId: { [Op.in]: companyIds } },
                    required: false,
                },
            ],
            where: {
                ...searchByName,
                [Op.or]: [
                    { '$userSubscriptions.userId$': userId },
                    { '$companySubscriptions.companyId$': { [Op.in]: companyIds } }
                ]
            },
            order: [
                [db.sequelize.col('companySubscriptions.name'), 'ASC']
            ]
        });

        res.json({
            success: true,
            totalItems: count,
            currentPage: page,
            pageSize: limit,
            result: nodes.map(({ nodeId, name }) => ({ nodeId, name }))
        });

    } catch (error) { next(error); }
})

meRouter.put('/active-dashboard', async (req, res, next) => {
    const { companyId } = req.body

    if (!companyId) {
        req.session.activeDashboard = 'userSubs'

        return res.json({
            activeDashboard: req.session.activeDashboard,
            activeCompany: req.session.activeCompany
        })
    }

    const isMyCompany = await req.user.hasCompany(companyId)
    if (!isMyCompany) return res.sendStatus(403)

    req.session.activeDashboard = 'companySubs'
    req.session.activeCompany = (await db.Companies.findByPk(companyId, { attributes: ['companyId', 'coordinate', 'name', 'type',], limit: 1 }))


    res.json({
        activeDashboard: req.session.activeDashboard,
        activeCompany: req.session.activeCompany
    })
})


export default meRouter;
