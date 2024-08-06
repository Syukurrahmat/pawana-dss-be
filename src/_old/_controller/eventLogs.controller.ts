import { Op } from 'sequelize';
import db from '../_models/index.js';
import { ControllerType } from '../_types/index.js';
import { Request } from 'express';
import moment, { Moment } from "moment";
import EventLogs from '../_models/eventLogs.js';


export const getEventLogsInRange = (companyId: number | string, startDate: Date, endDate: Date) => (
    db.EventLogs.findAll({
        attributes: { exclude: ['createdAt', 'updatedAt', 'location', 'description'] },
        where: {
            companyId: companyId,
            [Op.or]: [
                { startDate: { [Op.between]: [startDate, endDate] } },
                { endDate: { [Op.between]: [startDate, endDate] } },
                {
                    startDate: { [Op.lte]: startDate },
                    endDate: { [Op.gte]: endDate }
                },
                {
                    startDate: { [Op.lte]: startDate },
                    endDate: { [Op.is]: undefined }
                }
            ]
        },
        order: [['endDate', 'DESC']]
    })
)


export const getCalenderEventLogs: ControllerType = async (req, res, next) => {
    const companyId = req.params.id
    const tz = req.session.tz!

    const monthQuery = req.query.month as string;

    const month = moment(monthQuery, 'YYYY-MM', true).isValid()
        ? moment.tz(monthQuery, 'YYYY-MM', tz)
        : moment.tz(tz)

    const startOfMonth = month.clone().startOf('month').subtract(6, 'days').toDate();
    const endOfMonth = month.clone().endOf('month').add(6, 'days').toDate();

    const events = await getEventLogsInRange(companyId, startOfMonth, endOfMonth)
        .then((e) => Promise.all(e.map(f => identifyEventStatus(f, req.session.tz!))))

    res.json({
        success: true,
        result: events
    });
};

export const getCurrentEventLogs: ControllerType = async (req, res, next) => {
    const tz = req.session.tz!;
    const companyId = req.params.id;
    
    
    const startOfToday = moment().startOf('day').toDate()
    const endOfToday = moment().endOf('day').toDate()

    const completed = await db.EventLogs.findAndCountAll({
        attributes: { exclude: ['createdAt', 'updatedAt', 'location', 'description'] },
        where: {
            companyId,
            [Op.or]: [
                { isCompleted: true },
                { endDate: { [Op.lt]: startOfToday } }
            ]
        },
        limit: 5,
        order: [['endDate', 'DESC']],
    })

    
    const inprogress = await db.EventLogs.findAndCountAll({
        attributes: { exclude: ['createdAt', 'updatedAt', 'location', 'description'] },
        where: {
            companyId,
            startDate: { [Op.lte]: startOfToday },
            isCompleted: false,
            [Op.or]: [
                { endDate: { [Op.is]: undefined } },
                { endDate: { [Op.gte]: startOfToday } }
            ]
        },
    })

    const upcoming = await db.EventLogs.findAndCountAll({
        attributes: { exclude: ['createdAt', 'updatedAt', 'location', 'description'] },
        where: {
            companyId,
            startDate: { [Op.gt]: endOfToday }
        }
    });

    await Promise.all(completed.rows.map(async (e) => {
        if (!e.isCompleted) {
            e.isCompleted = true
            await e.save()
        }
        e.status = 'completed'
    }))

    inprogress.rows.forEach(e => e.status = 'inProgress')
    upcoming.rows.forEach(e => e.status = 'upcoming')

    // calculateEventDuration(completed.rows, tz)
    // calculateEventDuration(inprogress.rows, tz)
    // calculateEventDuration(upcoming.rows, tz)

    res.json({
        success: true,
        result: {
            complete: {
                count: completed.count,
                events: completed.rows
            },
            inProgress: {
                count: inprogress.count,
                events: inprogress.rows
            },
            upcoming: {
                count: upcoming.count,
                events: upcoming.rows
            },
        }
    });
};

export const getEventLogsById: ControllerType = async (req, res, next) => {
    const { id: companyId, eventId: eventLogId } = req.params;

    const event = await db.EventLogs.findOne({
        where: { companyId, eventLogId },
        attributes: { exclude: ['status'] }
    });

    if (!event) return res.status(404);

    await identifyEventStatus(event, req.session.tz!);
    calculateEventDuration(event, req.session.tz!)

    res.json({
        success: true,
        result: event
    });

};

export const createNewEvent: ControllerType = async (req, res, next) => {
    let { name, description, startDate, endDate, location, type, isCompleted } = req.body;
    const companyId = parseInt(req.params.id);

    const startDateMom = moment(startDate)
    const endDateMom = endDate ? moment.tz(endDate) : undefined

    if (!startDateMom.isValid() || (endDateMom && !endDateMom.isValid())) return res.status(400)
    if (endDateMom && !endDateMom.isAfter(startDateMom)) endDate = startDate

    try {
        const event = await db.EventLogs.create({
            companyId,
            startDate,
            endDate,
            name,
            description,
            location,
            type,
            isCompleted: endDate && isCompleted ? true : false,
        });

        res.json({
            success: Boolean(event),
            message: event ? 'Kegiatan berhasil dibuat' : 'Kegiatan gagal dibuat',
        });

    } catch (error) { next(error) }
};

export const deleteEvent: ControllerType = async (req, res, next) => {
    const { id: companyId, eventId: eventLogId } = req.params;

    try {
        const deletedEvent = await db.EventLogs.destroy({
            where: { companyId, eventLogId },
        });

        res.json({
            success: Boolean(deletedEvent),
            message: deletedEvent ? 'Kegiatan berhasil Dihapus' : 'Kegiatan gagal Dihapus',
        });

    } catch (error) { next(error); }

};



export const setEventIsCompleted: ControllerType = async (req, res, next) => {
    const tz = req.session.tz!
    const { id: companyId, eventId: eventLogId } = req.params;

    try {
        const event = await db.EventLogs.findOne({ where: { companyId, eventLogId }, attributes: ['startDate', 'eventLogId'] });
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const startDate = moment.tz(event.startDate, tz).startOf('d')
        const now = moment.tz(tz).endOf('d')

        if (now.isBefore(startDate)) return res.json({
            success: false,
            message: 'Kegiatan gagal diatur selesai'
        });

        event.endDate = now.toDate();
        event.isCompleted = true;

        await event.save();

        res.json({
            success: true,
            message: 'Kegiatan berhasil diatur selesai'
        });

    } catch (error) { next(error); }

};

export const setEventIsStartNow: ControllerType = async (req, res, next) => {
    const { id: companyId, eventId: eventLogId } = req.params;

    try {
        const event = await db.EventLogs.findOne({ where: { companyId, eventLogId } });

        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (event.endDate == event.startDate) event.endDate = event.startDate;
        event.startDate = new Date();

        await event.save();

        res.json({
            success: true,
            message: 'Kegiatan berhasil diatur untuk mulai sekarang'
        });

    } catch (error) { next(error); }

};

export const editEvent: ControllerType = async (req, res, next) => {
    const { id: companyId, eventId: eventLogId } = req.params;
    const { name, description, startDate, endDate, location, type, isCompleted } = req.body;

    if (startDate && endDate && moment(endDate).isBefore(moment(startDate))) return res.status(400);

    try {
        const event = await db.EventLogs.findOne({ where: { companyId, eventLogId } });

        if (!event) return res.status(404).json({ message: 'Event not found' });

        event.name = name || event.name;
        event.description = description || event.description;
        event.startDate = startDate || event.startDate;
        event.endDate = endDate || event.endDate;
        event.location = location || event.location;
        event.type = type || event.type;
        event.isCompleted = moment(event.endDate).isAfter(moment()) ? false : isCompleted;

        await event.save();

        res.json({
            success: true,
            message: 'Kegiatan berhasil disunting'
        });

    } catch (error) { next(error) }
};

export async function identifyEventStatus(event: EventLogs, tz: string) {
    const now = moment.tz(tz);
    const startOfToday = now.clone().startOf('d').toDate();
    const endOfToday = now.clone().endOf('d').toDate();

    const startDateEvent = moment.tz(event.startDate, tz)
    const endDateEvent = event.endDate ? moment.tz(event.endDate, tz) : null

    if (event.isCompleted || (endDateEvent && endDateEvent.isBefore(startOfToday))) {
        event.status = 'completed';

        if (!event.isCompleted) {
            event.isCompleted = true
            await event.save()
        }

    } else if (startDateEvent.isAfter(endOfToday)) {
        event.status = 'upcoming';
    } else {
        event.status = 'inProgress';
    }

    return event;
}

export function calculateEventDuration(eventLogs: EventLogs[] | EventLogs, tz: string, boundary?: { startDate: Moment; endDate: Moment; }) {
    const startBoundary = boundary?.startDate;
    const endBoundary = boundary?.endDate || moment.tz(tz);

    (Array.isArray(eventLogs) ? eventLogs : [eventLogs]).forEach(event => {
        let eventStartMom = moment.tz(event.startDate, tz);
        let eventEndMom = event.endDate ? moment.tz(event.endDate, tz) : endBoundary;


        if (boundary) {
            if (moment(eventStartMom).isBefore(startBoundary)) eventStartMom = startBoundary!;
            if (moment(eventEndMom).isAfter(endBoundary)) eventEndMom = endBoundary;
        }
        event.duration = eventEndMom.diff(eventStartMom, 'day') + 1;
    });

    return eventLogs
};
