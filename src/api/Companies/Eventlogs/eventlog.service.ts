import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Moment } from 'moment';
import moment from 'moment-timezone';
import { FindOptions, InferAttributes, Op } from 'sequelize';
import EventLogs from '../../../models/eventLogs.js';
import { CreateEventDto } from './dto/create-eventlog.dto.js';
import { UpdateEventDto } from './dto/update-eventlog.dto.js';

@Injectable()
export class EventlogsService {
    constructor(
        @InjectModel(EventLogs)
        private EventLogsDB: typeof EventLogs,
    ) { }

    async create(companyId: number, createDto: CreateEventDto) {
        let { name, description, startDate, endDate, location, type, isCompleted } = createDto;


        if (endDate && !moment(endDate).isAfter(startDate)) endDate = startDate

        const event = await this.EventLogsDB.create({
            companyId,
            startDate: startDate!,
            name: name!,
            type: type!,
            description: description!,
            endDate,
            location,
            isCompleted: endDate && isCompleted ? true : false,
        });

        if (!event) throw new UnprocessableEntityException('Data tidak bisa diproses');

        return event
    }


    async findAll(companyId: number, monthQuery: string | undefined, tz: string) {
        const month = monthQuery && moment(monthQuery, 'YYYY-MM', true).isValid()
            ? moment.tz(monthQuery, 'YYYY-MM', tz)
            : moment.tz(tz)

        const startOfMonth = month.clone().startOf('month').subtract(6, 'days').toDate();
        const endOfMonth = month.clone().endOf('month').add(6, 'days').toDate();

        const events = await this.getEventLogsInRange(companyId, startOfMonth, endOfMonth)
            .then((e) => Promise.all(e.map(f => this.identifyEventStatus(f, tz))))

        return events
    }

    async getCurrentEventSummary(companyId: number, tz: string) {
        const startOfToday = moment().startOf('day').toDate()
        const endOfToday = moment().endOf('day').toDate()

        const eventAttributes = { exclude: ['createdAt', 'updatedAt', 'location', 'description'] }

        const [completed, inprogress, upcoming] = await Promise.all([
            this.EventLogsDB.findAndCountAll({
                attributes: eventAttributes,
                where: {
                    companyId,
                    [Op.or]: [
                        { isCompleted: true },
                        { endDate: { [Op.lt]: startOfToday } }
                    ]
                },
                limit: 5,
                order: [['endDate', 'DESC']],
            }),
            this.EventLogsDB.findAndCountAll({
                attributes: eventAttributes,
                where: {
                    companyId,
                    startDate: { [Op.lte]: startOfToday },
                    isCompleted: false,
                    [Op.or]: [
                        { endDate: { [Op.is]: undefined } },
                        { endDate: { [Op.gte]: startOfToday } }
                    ]
                },
            }),
            this.EventLogsDB.findAndCountAll({
                attributes: eventAttributes,
                where: {
                    companyId,
                    startDate: { [Op.gt]: endOfToday }
                }
            })
        ])

        await Promise.all(completed.rows.map(async (e) => {
            if (!e.isCompleted) {
                e.isCompleted = true
                await e.save()
            }
            e.status = 'completed'
        }))

        inprogress.rows.forEach(e => e.status = 'inProgress')
        upcoming.rows.forEach(e => e.status = 'upcoming')

        return {
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
    }



    async findOne(companyId: number, eventId: number, tz: string) {
        const event = await this.getEvents(companyId, eventId, {
            attributes: { exclude: ['status'] }
        })

        await this.identifyEventStatus(event, tz);
        this.calculateEventDuration(event, tz)

        return event
    }

    async update(companyId: number, eventLogId: number, updateDto: UpdateEventDto) {
        const event = await this.getEvents(companyId, eventLogId)

        const { name, description, startDate, endDate, location, type, isCompleted } = updateDto;

        if (startDate && endDate) {
            if (moment(endDate).isBefore(moment(startDate))) throw new BadRequestException('end date tidak boleh sebelum  start date ')
        }

        const [affected] = await this.EventLogsDB.update({
            name,
            description,
            startDate,
            endDate,
            location,
            type,
            isCompleted: moment(event.endDate).isAfter(moment()) ? false : isCompleted
        },
            { where: { companyId, eventLogId } }
        )

        if (!affected) throw new UnprocessableEntityException('Data tidak bisa diproses');

        return 'success'
    }

    async delete(companyId: number, eventId: number) {
        const event = await this.getEvents(companyId, eventId)
        await event.destroy()

        return 'success'
    }


    async setEventIsCompleted(companyId: number, eventLogId: number, tz: string) {
        const event = await this.getEvents(companyId, eventLogId, {
            attributes: ['startDate', 'eventLogId']
        })

        const startDate = moment.tz(event.startDate, tz).startOf('d')
        const now = moment.tz(tz).endOf('d')

        if (now.isBefore(startDate)) throw new BadRequestException('Kegiatan gagal diatur selesai')

        event.endDate = now.toDate();
        event.isCompleted = true;
        await event.save();

        return 'Kegiatan berhasil diatur selesai'
    };

    async setEventIsStartNow(companyId: number, eventLogId: number) {
        const event = await this.getEvents(companyId, eventLogId, {
            attributes: ['startDate', 'eventLogId']
        })

        if (event.endDate == event.startDate) event.endDate = event.startDate;
        event.startDate = new Date();

        await event.save();

        return 'Kegiatan berhasil diatur untuk mulai sekarang'
    }

    async getEvents(companyId: number, id: number, opt?: FindOptions<InferAttributes<EventLogs, { omit: never }>>) {
        const event = await this.EventLogsDB.findOne({
            where: { eventLogId: id, companyId },
            ...opt
        })

        if (!event) throw new NotFoundException()
        return event
    }

    async identifyEventStatus(event: EventLogs, tz: string) {
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

    calculateEventDuration(eventLogs: EventLogs[] | EventLogs, tz: string, boundary?: { startDate: Moment; endDate: Moment; }) {
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

    async getEventLogsInRange(companyId: number, startDate: Date, endDate: Date) {
        return await this.EventLogsDB.findAll({
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
    }

}
