import { Injectable } from '@nestjs/common';


import { InjectModel } from '@nestjs/sequelize';
import moment, { Moment } from 'moment';
import { Op, col, fn, literal, where } from 'sequelize';
import { EventlogsService } from '../Api/Companies/Eventlogs/eventlog.service.js';
import { MISSING_DATA_TRESHOLD } from '../constants/server.js';
import { average } from '../lib/common.utils.js';
import Companies from '../models/companies.js';
import DataLogs from '../models/datalogs.js';
import { eventLogStatus, eventLogType } from '../models/eventLogs.js';
import Nodes from '../models/nodes.js';
import Reports from '../models/reports.js';
import Users from '../models/users.js';
import { categorizeCH4, categorizeCO2, categorizeISPU } from './logic/evaluateByConversionTable.js';
import { datalogsLinearImputation } from './logic/missingDataHandler.js';
import { NodesAverageInsightWithDate, SimpleDatalogs, SummaryData, TrenItem } from '../types/dashboardData.js';


const PERIODE_FORMAT = {
    month: 'YYY-MM',
    week: 'YYYY-[W]ww'
}

@Injectable()
export class SummaryService {
    constructor(
        @InjectModel(DataLogs) private DataLogsDB: typeof DataLogs,
        @InjectModel(Reports) private ReportsDB: typeof Reports,
        private eventLogsService: EventlogsService
    ) { }

    async getSummary(company: Companies, summaryType: 'week' | 'month', periodeQuery: string, tz: string) {
        const periodeQueryIsValid = moment(periodeQuery as string, PERIODE_FORMAT[summaryType], true).isValid();

        const isNotCurrentPeriode = periodeQueryIsValid && !moment.tz(periodeQuery, tz)
            .startOf(summaryType)
            .isSame(moment.tz(tz).startOf(summaryType));

        const endDate = isNotCurrentPeriode
            ? moment.tz(periodeQuery, tz).endOf(summaryType)
            : moment.tz(tz).endOf('d')

        const startDate = isNotCurrentPeriode
            ? endDate.clone().startOf(summaryType)
            : endDate.clone().subtract(1, summaryType).startOf('d').add(1, 'd')

        const indoorNodes = await company.getPrivateNodes();
        const outdoorNodes = await company.getSubscribedNodes({ joinTableAttributes: [] });

        const { tren: indoorTren, averageInThisPeriode: indoorAverage } = await this.getTrenNodes(indoorNodes, startDate, endDate);
        const { tren: outdoorTren, averageInThisPeriode: outdoorAverage } = await this.getTrenNodes(outdoorNodes, startDate, endDate);


        const reports = await this.ReportsDB.findAll({
            where: {
                [Op.and]: [
                    { createdAt: { [Op.between]: [startDate.toDate(), endDate.toDate()] } },
                    where(
                        literal(`ST_Distance_Sphere(coordinate, ST_GeomFromText('POINT(${company.coordinate[1]} ${company.coordinate[0]})'))`),
                        { [Op.lte]: 500 }
                    )
                ]
            },
            include: [{
                model: Users,
                attributes: ['name', 'userId', 'profilePicture']
            }],
            order: [
                [
                    literal(`ST_Distance_Sphere(coordinate, ST_GeomFromText('POINT(${company.coordinate[1]} ${company.coordinate[0]})'))`),
                    'ASC'
                ]
            ]
        });

        const reportSummary = {
            average: average(reports.map(e => e.rating)),
            count: reports.length,
            countPerStar: Array.from(
                { length: 5 },
                (_, i) => reports.filter(e => e.rating == (5 - i)).length),

            reports: reports
        };


        const eventLogs = await this.eventLogsService
            .getEventLogsInRange(company.companyId!, startDate.toDate(), endDate.toDate())
            .then((e) =>
                Promise.all(e.map(f => this.eventLogsService.identifyEventStatus(f, tz)))
            );

        this.eventLogsService.calculateEventDuration(eventLogs, tz, { startDate, endDate: endDate });

        const countOfDayPerType = eventLogType.map(e => ({
            type: e,
            set: new Set(),
        }))

        eventLogs.forEach(event => {
            let eventStartMom = moment.tz(event.startDate, tz);
            let eventEndMom = event.endDate
                ? moment.tz(event.endDate, tz)
                : endDate;

            if (moment(eventStartMom).isBefore(startDate)) eventStartMom = startDate;
            if (moment(eventEndMom).isAfter(endDate)) eventEndMom = endDate;

            const current = eventStartMom.clone();
            const typeSet = countOfDayPerType.find(e => e.type == event.type)?.set
            if (!typeSet) return

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


        const eventLogsSummary = {
            count: {
                all: eventLogs.length,

                countStatus: eventLogStatus.filter(e => e !== 'upcoming').map(e => ({
                    status: e,
                    count: eventLogs.filter(f => f.status == e).length
                })),

                countType: eventLogType.map(e => ({
                    type: e,
                    count: eventLogs.filter(f => f.type == e).length,
                    days: countOfDayPerType.find(f => f.type == e)?.set.size || 0
                }))

            },
            eventIdLongestEvent: eventLogs.at(0)?.eventLogId,
            eventLogs,
        };


        const result: SummaryData = {
            meta: {
                company: company.toJSON(),
                startDate: startDate.toDate(),
                endDate: endDate.toDate(),
            },
            averageData: {
                indoor: indoorAverage,
                outdoor: outdoorAverage
            },
            tren: this.combiningTren(indoorTren, outdoorTren),
            reports: reportSummary,
            eventLogs: eventLogsSummary,
        };

        return result
    };


    async getAveragedDatalogs(nodes: Nodes[], opt: { startDate: Moment; endDate: Moment; }) {
        const { startDate, endDate } = opt;

        const data = await this.DataLogsDB.findAll({
            where: {
                nodeId: { [Op.in]: nodes.map(e => e.nodeId!) },
                datetime: { [Op.between]: [startDate, endDate] }
            },
            attributes: [
                'datetime',
                [
                    literal(`DATE_FORMAT(DATE_ADD(CONVERT_TZ(datetime, '+00:00', '${startDate.format('Z')}'), INTERVAL 1 HOUR), '%Y-%m-%d %H:00:00')`),
                    'hour'
                ],
                [fn('AVG', col('pm25')), 'pm25'],
                [fn('AVG', col('pm100')), 'pm100'],
                [fn('FLOOR', fn('AVG', col('ch4'))), 'ch4'],
                [fn('FLOOR', fn('AVG', col('co2'))), 'co2'],
            ],
            group: [col('hour')],
            order: [['datetime', 'DESC']],
        });

        return data.map(({ dataValues: { pm100, pm25, co2, ch4, hour } }) => ({
            datetime: moment.tz(hour!, startDate.tz()!).toDate(),
            pm100,
            pm25,
            co2,
            ch4,
        }));
    }



    async getTrenNodes(nodes: Nodes[], startDate: Moment, endDate: Moment) {
        const tz = startDate.tz()!;
        const subtractedStartDate = startDate.clone().subtract(3, 'd');
        let averageInThisPeriode: NodesAverageInsightWithDate | undefined


        // ======================= MENGAMBIL DATALOGS DARI DATABASE ======================= 
        const datalogsFromDB: SimpleDatalogs[] = await this.getAveragedDatalogs(nodes, {
            startDate: subtractedStartDate,
            endDate: endDate,
        });

        if (!datalogsFromDB.length) return { averageInThisPeriode, tren: [] }

        // ======================= MENGELOMPOKKAN DATALOGS BERDASARKAN JAM ======================= 

        const mapOfDatalogsPerHour = new Map(datalogsFromDB.map(e => [e.datetime.getTime(), e]));
        const countOfHour = endDate.diff(subtractedStartDate, 'h');

        const datalogsPerHours = Array
            .from({ length: countOfHour }, (_, d) => endDate.clone().subtract(d, 'h').startOf('h').toDate())
            .map(hour => mapOfDatalogsPerHour.get(hour.getTime()) || { datetime: hour, pm25: NaN, pm100: NaN, ch4: NaN, co2: NaN });


        // ======================= MENGELOMPOKKAN DATALOGS PER JAM BERDASARKAN HARI ======================= 

        const mapOfDatalogsPerDay = new Map<number, SimpleDatalogs[]>();

        datalogsPerHours.forEach(item => {
            const copiedItem = { ...item };
            copiedItem.datetime = moment(copiedItem.datetime).tz(tz).startOf('day').toDate();

            const itemKey = copiedItem.datetime.getTime();
            mapOfDatalogsPerDay.get(itemKey)?.push(copiedItem) || mapOfDatalogsPerDay.set(itemKey, []);
        });


        // ======================= MENGHITUNG RATA RATA PERHARI =======================

        let datalogsPerDay: SimpleDatalogs[] = []

        mapOfDatalogsPerDay.forEach((datasInThisDay, day) => {
            const datetime = new Date(day)

            // menghitung data hilang dan mengisi nya dengan linear imputation jika ada 
            const missingData = datasInThisDay.filter(e => isNaN(e.pm25)).length / datasInThisDay.length;

            if (missingData > MISSING_DATA_TRESHOLD) {
                return datalogsPerDay.push({ datetime, pm25: NaN, pm100: NaN, co2: NaN, ch4: NaN });
            }

            if (missingData) datasInThisDay = datalogsLinearImputation(datasInThisDay);

            datalogsPerDay.push({
                datetime,
                pm25: average(datasInThisDay.map(e => e.pm25)),
                pm100: average(datasInThisDay.map(e => e.pm100)),
                co2: average(datasInThisDay.map(e => e.co2)),
                ch4: average(datasInThisDay.map(e => e.ch4)),
            })
        })

        const missingData = datalogsPerDay.filter(e => isNaN(e.pm25)).length / datalogsPerDay.length;

        if (missingData <= MISSING_DATA_TRESHOLD) {

            if (missingData) datalogsPerDay = datalogsLinearImputation(datalogsPerDay)
            datalogsPerDay = datalogsPerDay.filter(e => e.pm25);

            const valueOfAverageInThisPeriode = {
                datetime: startDate.toDate(),
                pm100: average(datalogsPerDay.map(e => e.pm100)),
                pm25: average(datalogsPerDay.map(e => e.pm25)),
                co2: average(datalogsPerDay.map(e => e.co2)),
                ch4: average(datalogsPerDay.map(e => e.ch4)),
            };

            averageInThisPeriode = this.evaluateDatalogs(valueOfAverageInThisPeriode, true);
        }

        const tren = datalogsPerDay
            .filter(e => (e.pm25 && moment(e.datetime).tz(tz).isBetween(startDate, endDate, undefined, '[]')))
            .map(e => this.evaluateDatalogs(e))

        return {
            tren,
            averageInThisPeriode,
        }
    }

    evaluateDatalogs(dt: SimpleDatalogs, withRecomendation = false): NodesAverageInsightWithDate {
        const { datetime, pm100, pm25, ch4, co2 } = dt;

        return {
            datetime,
            ispu: categorizeISPU(pm25, pm100, withRecomendation),
            ch4: categorizeCH4(ch4, withRecomendation),
            co2: categorizeCO2(co2, withRecomendation),
            pm25: pm25,
            pm100: pm100,
        };
    }

    calculateAverage(datalogs: SimpleDatalogs[], date: Moment) {

        const averageValue: SimpleDatalogs = {
            datetime: date.toDate(),
            pm100: average(datalogs.map(e => e.pm100)),
            pm25: average(datalogs.map(e => e.pm25)),
            co2: average(datalogs.map(e => e.co2)),
            ch4: average(datalogs.map(e => e.ch4)),
        };

        return this.evaluateDatalogs(averageValue, true);
    }

    combiningTren(indoor: NodesAverageInsightWithDate[] | null, outdoor: NodesAverageInsightWithDate[] | null) {
        const combinedData: Record<string, TrenItem> = {};

        indoor?.forEach(entry => {
            const { datetime, ...value } = entry;
            const key = datetime.toISOString();

            if (!combinedData[key]) combinedData[key] = { datetime };
            combinedData[key].indoor = value;
        });

        outdoor?.forEach(entry => {
            const { datetime, ...value } = entry;
            const key = datetime.toISOString();

            if (!combinedData[key]) combinedData[key] = { datetime, };
            combinedData[key].outdoor = value;
        });

        return Object.values(combinedData);
    }
}