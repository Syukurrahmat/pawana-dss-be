import { Op } from 'sequelize';
import db from '../models/index.js';
import { ControllerType, QueryOfSting } from '../types/index.js';
import { parseQueries } from '../utils/common.utils.js';
import moment from 'moment-timezone';
import EventLogs from '../models/eventLogs.js';
import { Request } from 'express'


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

        const company = await db.Companies.findOne({
            where: { companyId },
            include: {
                model: db.Users,
                attributes: ['name', 'userId', 'phone', 'profilePicture', 'email'],
            },
        })

        if (!company) {
            return res.json({
                success: false,
                message: 'Grup tidak ditemukan',
            });
        }

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

    console.log({ name, address, description, coordinate })

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
        const company = await db.Companies.findByPk(companyId);

        if (!company) {
            res.json({
                success: false,
                message: 'Grup tidak ditemukan',
            });
            return;
        }

        const nodes = await company.getSubscribedNodes({
            where: { ...search },
            attributes: [
                'nodeId', 'name', 'coordinate', 'status', 'lastDataSent',
                [db.sequelize.col('CompanySubscriptions.createdAt'), 'joinedAt'],
                [db.sequelize.col('CompanySubscriptions.companySubscriptionId'), 'subscriptionId']
            ],
            joinTableAttributes: [],
            order: [[db.sequelize.col('joinedAt'), 'DESC']],
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

export const addNodeSubscription: ControllerType = async (req, res, next) => {
    const { id: companyId } = req.params;
    const nodeIds = req.body.nodeIds
    const SUBS_LIMIT = 5


    console.log(nodeIds)
    if (!(Array.isArray(nodeIds) && nodeIds.length)) return res.status(400)

    const company = await db.Companies.findOne({ where: { companyId }, attributes: ['companyId'] });

    if (!company) return res.status(404).json({
        success: false,
        message: 'Usaha tidak ditemukan',
    });

    const countSubscribed = await company.countSubscribedNodes()

    if (countSubscribed >= SUBS_LIMIT) return res.status(404).json({
        success: false,
        message: 'Melebih batas yang diizinkan',
    });


    const nodes = await db.Nodes.findAll({
        where: { nodeId: { [Op.in]: nodeIds.filter((e) => e) } },
        attributes: ['nodeId'],
    });



    await company.addSubscribedNodes(nodes.slice(0, SUBS_LIMIT - countSubscribed))

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
                'nodeId', 'name', 'coordinate', 'status', 'lastDataSent', 'createdAt',
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


//  =================================================

export const getCalenderEventLogs: ControllerType = async (req, res, next) => {
    const { id: companyId } = req.params
    const { month } = req.query as QueryOfSting


    if (!moment(month, 'YYYY-MM', true).isValid()) return res.send(400)

    const monthMoment = moment(month, 'YYYY-MM')
    const startOfMonth = monthMoment.clone().startOf('month').subtract(6, 'days').toDate();
    const endOfMonth = monthMoment.clone().endOf('month').add(6, 'days').toDate();

    const events = await db.EventLogs.findAll({
        attributes: { exclude: ['createdAt', 'updatedAt', 'status', 'location', 'description'] },
        where: {
            companyId: companyId,
            [Op.or]: [
                { startDate: { [Op.between]: [startOfMonth, endOfMonth] } },
                { endDate: { [Op.between]: [startOfMonth, endOfMonth] } },
                {
                    startDate: { [Op.lte]: startOfMonth },
                    endDate: { [Op.gte]: endOfMonth }
                },
                {
                    startDate: { [Op.lte]: startOfMonth },
                    endDate: { [Op.is]: null }
                }
            ]
        }
    })

    res.json({
        success: true,
        result: events.map(e => identifyEventStatus(req, e))
    })
};

export const getCurrentEventLogs: ControllerType = async (req, res, next) => {
    const { id: companyId } = req.params

    const now = moment().startOf('day')

    const { rows: complete, count: completeCount } = await db.EventLogs.findAndCountAll({
        attributes: { exclude: ['createdAt', 'updatedAt', 'status', 'location', 'description'] },
        where: {
            companyId,
            isCompleted: true
        },
        limit: 5,
        order: [['startDate', 'DESC']]
    })

    const { rows: inProgress, count: inProgressCount } = await db.EventLogs.findAndCountAll({
        attributes: { exclude: ['createdAt', 'updatedAt', 'status', 'location', 'description'] },
        where: {
            companyId,
            startDate: { [Op.lte]: now },
            [Op.or]: [
                { endDate: { [Op.is]: null } },
                { endDate: { [Op.gte]: now } }
            ]
        }
    });

    const { rows: upcoming, count: upcomingCount } = await db.EventLogs.findAndCountAll({
        attributes: { exclude: ['createdAt', 'updatedAt', 'status', 'location', 'description'] },
        where: {
            companyId,
            startDate: { [Op.gt]: now }
        }
    });

    res.json({
        success: true,
        result: {
            complete: {
                count: completeCount,
                events: complete.map(e => ({ ...e.toJSON(), status: 'completed' }))
            },
            inProgress: {
                count: inProgressCount,
                events: inProgress.map(e => ({ ...e.toJSON(), status: 'inProgress' }))
            },
            upcoming: {
                count: upcomingCount,
                events: upcoming.map(e => ({ ...e.toJSON(), status: 'upcoming' }))
            },
        }
    })
};

export const getEventLogsById: ControllerType = async (req, res, next) => {
    const { id: companyId, eventId: eventLogId } = req.params

    let event = await db.EventLogs.findOne({
        where: { companyId, eventLogId },
        attributes: { exclude: ['status'] }
    })

    if (!event) return res.status(404)

    event = identifyEventStatus(req, event)

    res.json({
        success: true,
        result: event
    })

};

export const createNewEvent: ControllerType = async (req, res, next) => {
    const { id: companyId } = req.params
    const { name, description, startDate, endDate, location, type, isCompleted } = req.body

    if (endDate && moment(endDate).isBefore(moment(startDate))) return res.status(400)

    const isCompletedProp = moment(endDate).isAfter(moment()) ? false : isCompleted

    try {
        const event = await db.EventLogs.create({
            companyId: parseInt(companyId),
            name,
            description,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : undefined,
            location,
            isCompleted: isCompletedProp,
            type,
        })

        if (!event) return next()

        res.json({
            success: Boolean(event),
            message: event ? 'Kegiatan berhasil dibuat' : 'Kegiatan gagal dibuat',
        });

    } catch (error) { next(error) }

};

export const deleteEvent: ControllerType = async (req, res, next) => {
    const { id: companyId, eventId: eventLogId } = req.params

    try {
        const deletedEvent = await db.EventLogs.destroy({
            where: { companyId, eventLogId },
        })


        res.json({
            success: Boolean(deletedEvent),
            message: deletedEvent ? 'Kegiatan berhasil Dihapus' : 'Kegiatan gagal Dihapus',
        });

    } catch (error) { next(error) }

};

export const setEventIsCompleted: ControllerType = async (req, res, next) => {
    const { id: companyId, eventId: eventLogId } = req.params

    try {
        const event = await db.EventLogs.findOne({ where: { companyId, eventLogId } })
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const endDate = moment()

        if (moment(endDate).isBefore(moment(event.startDate))) return res.status(400)

        event.endDate = endDate.toDate();
        event.isCompleted = true

        await event.save()

        res.json({
            success: true,
            message: 'Kegiatan berhasil diatur selesai'
        });

    } catch (error) { next(error) }

};

export const setEventIsStartNow: ControllerType = async (req, res, next) => {
    const { id: companyId, eventId: eventLogId } = req.params

    console.log('awoksow')

    try {
        const event = await db.EventLogs.findOne({ where: { companyId, eventLogId } })

        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (event.endDate == event.startDate) event.endDate = event.startDate
        event.startDate = new Date()

        await event.save()

        res.json({
            success: true,
            message: 'Kegiatan berhasil diatur untuk mulai sekarang'
        });

    } catch (error) { next(error) }

};

export const editEvent: ControllerType = async (req, res, next) => {
    const { id: companyId, eventId: eventLogId } = req.params
    const { name, description, startDate, endDate, location, type, isCompleted } = req.body

    if (startDate && endDate && moment(endDate).isBefore(moment(startDate))) return res.status(400)

    try {
        const event = await db.EventLogs.findOne({ where: { companyId, eventLogId } })

        if (!event) return res.status(404).json({ message: 'Event not found' });

        event.name = name || event.name;
        event.description = description || event.description;
        event.startDate = startDate || event.startDate;
        event.endDate = endDate || event.endDate;
        event.location = location || event.location;
        event.type = type || event.type;
        event.isCompleted = moment(event.endDate).isAfter(moment()) ? false : isCompleted

        await event.save()

        res.json({
            success: true,
            message: 'Kegiatan berhasil disunting'
        });

    } catch (error) { next(error) }
};


function identifyEventStatus(req: Request, event: EventLogs) {
    const today = moment()
    const startOfToday = today.clone().startOf('d').toDate()
    const endOfToday = today.clone().endOf('d').toDate()

    const startDate = new Date(event.startDate);
    const endDate = event.endDate ? new Date(event.endDate) : null;

    if ((endDate !== null && endDate <= startOfToday) || event.isCompleted) {
        event.status = 'completed'
    } else if (startDate > endOfToday) {
        event.status = 'upcoming'
    } else {
        event.status = 'inProgress'
    }

    return event
}
