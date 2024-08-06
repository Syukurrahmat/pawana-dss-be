import moment from 'moment-timezone';
import { SUBS_LIMIT } from '../constants/server.js';
import db from '../models/index.js';
import { ControllerType } from '../types/index.js';
import { parseQueries } from '../utils/common.utils.js';

const companyAttr = ['companyId', 'coordinate', 'name', 'type'];

export const getProfileInformation: ControllerType = async (req, res, next) => {
    const { password, address, description, ...rest } = req.user!.toJSON();
    const { role } = rest
    const { timezone } = req.query as Record<string, string>
    if (moment.tz.zone(timezone)) req.session.tz = timezone;


    res.json({
        ...rest,
        role,
        view: {
            company: req.session.viewCompany,
            user: req.session.viewUser
        }
    });
};

export const getRemainingSubsLimit: ControllerType = async (req, res, next) => {
    res.json({ success: true, result: SUBS_LIMIT - await req.user!.countSubscribedNodes() });
};


export const getMyCompaniesList: ControllerType = async (req, res, next) => {
    const { page, limit, search, order, offset } = parseQueries(req)
    const { role, userId } = req.user!

    const isAll = req.query.all == 'true'
    const paginationQuery = isAll ? {} : { offset, limit }


    try {
        if (role == 'regular') return res.sendStatus(403);
        const filter = role == 'manager' ? { managedBy: userId } : {}

        const { count, rows } = await db.Companies.findAndCountAll({
            attributes: companyAttr,
            where: { ...filter, ...search },
            ...paginationQuery,
        })

        return res.json({
            success: true,
            totalItems: count,
            currentPage: page,
            pageSize: !isAll ? limit : count,
            result: rows
        });

    } catch (error) { next(error) }
};

export const changeActiveDashboard: ControllerType = async (req, res, next) => {
    const { role } = req.user!

    if (role == 'regular') return res.sendStatus(403);

    const { companyId } = req.body;
    if (!companyId) return res.sendStatus(400);

    const company = await db.Companies.findByPk(companyId, {
        attributes: [...companyAttr, 'managedBy'],
        limit: 1
    });

    if (!company) return res.sendStatus(403);
    if (role == 'manager' && !req.user?.hasCompany(company)) return res.sendStatus(403);

    req.session.viewCompany = company.toJSON();

    if (['admin', 'gov'].includes(role)) {
        const companyManager = await db.Users.findByPk(company.managedBy, { attributes: ['userId', 'role', 'name'] })
        req.session.viewUser = companyManager!
    }

    res.json({
        view: {
            company: req.session.viewCompany,
            user: req.session.viewUser
        }
    });
};
