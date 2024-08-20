import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import moment, { Moment } from 'moment';
import { Op, literal, where } from 'sequelize';
import { EventlogsService } from '../../Api/Companies/Eventlogs/eventlog.service.js';
import { average } from '../../lib/common.utils.js';
import Companies from '../../models/companies.js';
import DataLogs from '../../models/datalogs.js';
import { eventLogStatus, eventLogType } from '../../models/eventLogs.js';
import Reports from '../../models/reports.js';
import Users from '../../models/users.js';
import { EventLogsSummary, ReportSummary, SummaryData } from '../../types/dashboardData.js';
import { CategorizeValueService } from '../Logic/categorizingValue.service.js';
import { SummaryLogic } from './summary-logic.js';

const PERIODE_FORMAT = {
    month: 'YYY-MM',
    week: 'YYYY-[W]ww',
};

@Injectable()
export class SummaryService extends SummaryLogic {
    constructor(
        @InjectModel(Reports) private ReportsDB: typeof Reports,
        @InjectModel(DataLogs) DataLogsDB: typeof DataLogs,
        private eventLogsService: EventlogsService,
        categorizeValueService: CategorizeValueService
    ) {
        super(DataLogsDB, categorizeValueService);
    }

    async getSummary(
        company: Companies,
        summaryType: 'week' | 'month',
        periodeQuery: string,
        tz: string
    ) {
        const periodeQueryIsValid = moment(
            periodeQuery as string,
            PERIODE_FORMAT[summaryType],
            true
        ).isValid();

        const isNotCurrentPeriode =
            periodeQueryIsValid &&
            !moment
                .tz(periodeQuery, tz)
                .startOf(summaryType)
                .isSame(moment.tz(tz).startOf(summaryType));

        const endDate = isNotCurrentPeriode
            ? moment.tz(periodeQuery, tz).endOf(summaryType)
            : moment.tz(tz).endOf('d');

        const startDate = isNotCurrentPeriode
            ? endDate.clone().startOf(summaryType)
            : endDate.clone().subtract(1, summaryType).startOf('d').add(1, 'd');

        const indoorNodes = await company.getPrivateNodes();
        const outdoorNodes = await company.getSubscribedNodes({ joinTableAttributes: [] });

        const { tren: indoorTren, averageInThisPeriode: indoorAverage } =
            await this.getTrenAndAverageNodes(indoorNodes, startDate, endDate);
        const { tren: outdoorTren, averageInThisPeriode: outdoorAverage } =
            await this.getTrenAndAverageNodes(outdoorNodes, startDate, endDate);

        const result: SummaryData = {
            meta: {
                company: company.toJSON(),
                startDate: startDate.toDate(),
                endDate: endDate.toDate(),
            },
            averageData: {
                indoor: indoorAverage,
                outdoor: outdoorAverage,
            },
            tren: this.combiningTren(indoorTren, outdoorTren),
            reports: await this.getReportsSummary(company, startDate, endDate),
            eventLogs: await this.getEventLogsSummary(company, startDate, endDate, tz),
        };

        return result;
    }

    async getReportsSummary(
        company: Companies,
        startDate: Moment,
        endDate: Moment
    ): Promise<ReportSummary> {
        const reports = await this.ReportsDB.findAll({
            where: {
                [Op.and]: [
                    { createdAt: { [Op.between]: [startDate.toDate(), endDate.toDate()] } },
                    where(
                        literal(
                            `ST_Distance_Sphere(coordinate, ST_GeomFromText('POINT(${company.coordinate[1]} ${company.coordinate[0]})'))`
                        ),
                        { [Op.lte]: 500 }
                    ),
                ],
            },
            include: [
                {
                    model: Users,
                    attributes: ['name', 'userId', 'profilePicture'],
                },
            ],
            order: [
                [
                    literal(
                        `ST_Distance_Sphere(coordinate, ST_GeomFromText('POINT(${company.coordinate[1]} ${company.coordinate[0]})'))`
                    ),
                    'ASC',
                ],
            ],
        });

        return {
            average: average(reports.map((e) => e.rating)),
            count: reports.length,
            countPerStar: Array.from(
                { length: 5 },
                (_, i) => reports.filter((e) => e.rating == 5 - i).length
            ),
            reports: reports,
        };
    }

    async getEventLogsSummary(
        company: Companies,
        startDate: Moment,
        endDate: Moment,
        tz: string
    ): Promise<EventLogsSummary> {
        const eventLogs = await this.eventLogsService
            .getEventLogsInRange(company.companyId!, startDate.toDate(), endDate.toDate())
            .then((e) =>
                Promise.all(e.map((f) => this.eventLogsService.identifyEventStatus(f, tz)))
            );

        this.eventLogsService.calculateEventDuration(eventLogs, tz, {
            startDate,
            endDate: endDate,
        });

        const countOfDayPerType = eventLogType.map((e) => ({
            type: e,
            set: new Set(),
        }));

        eventLogs.forEach((event) => {
            let eventStartMom = moment.tz(event.startDate, tz);
            let eventEndMom = event.endDate ? moment.tz(event.endDate, tz) : endDate;

            if (moment(eventStartMom).isBefore(startDate)) eventStartMom = startDate;
            if (moment(eventEndMom).isAfter(endDate)) eventEndMom = endDate;

            const current = eventStartMom.clone();
            const typeSet = countOfDayPerType.find((e) => e.type == event.type)?.set;
            if (!typeSet) return;

            while (current.isSameOrBefore(eventEndMom)) {
                typeSet.add(current.format('YYYY-MM-DD'));
                current.add(1, 'days');
            }
        });

        eventLogs.sort((a, b) => {
            if (a.duration !== b.duration) return b.duration! - a.duration!;

            if (!a.endDate) return -1;
            if (!b.endDate) return 1;

            return moment(b.endDate).diff(moment(a.endDate));
        });

        return {
            count: {
                all: eventLogs.length,

                countStatus: eventLogStatus
                    .filter((e) => e !== 'upcoming')
                    .map((e) => ({
                        status: e,
                        count: eventLogs.filter((f) => f.status == e).length,
                    })),

                countType: eventLogType.map((e) => ({
                    type: e,
                    count: eventLogs.filter((f) => f.type == e).length,
                    days: countOfDayPerType.find((f) => f.type == e)?.set.size || 0,
                })),
            },
            eventIdLongestEvent: eventLogs.at(0)?.eventLogId,
            eventLogs,
        };
    }
}
