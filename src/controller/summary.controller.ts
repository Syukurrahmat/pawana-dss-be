import moment, { Moment } from 'moment';
import { Op, col, fn, literal, where } from 'sequelize';
import { MISSING_DATA_TRESHOLD } from '../constants/server.js';
import db from '../models/index.js';
import Nodes from '../models/nodes.js';
import { evaluateCH4, evaluateCO2, evaluateISPU } from '../services/decisionLogic/evaluateByConversionTable.js';
import { GRKCategorize, ISPUValue } from '../types/dashboardData.js';
import { ControllerType } from '../types/index.js';
import { Summary } from '../types/summaryData.js';
import { average } from '../utils/common.utils.js';
import { DatalogsLinearImputation } from '../utils/dataAnalyze.utils.js';
import { getEventLogsInRange, identifyEventStatus } from './eventLogs.controller.js';
import { calculateEventDuration } from './eventLogs.controller.js';
import { eventLogStatus, eventLogType } from '../models/eventLogs.js';

type BasicDataLog = {
    datetime: Date;
    pm25: number;
    pm100: number;
    ch4: number;
    co2: number;
};

type DataLogWithAnalize = {
    datetime: Date;
    ispu: [ISPUValue, ISPUValue] | null;
    co2: GRKCategorize;
    ch4: GRKCategorize;
    pm25: number;
    pm100: number;
};

type getSummary = (periode: 'month' | 'week') => ControllerType

const PERIODE_FORMAT = {
    month: 'YYY-MM',
    week: 'YYYY-[W]ww'
}

export const getSummary: getSummary = (summaryType) => async (req, res, next) => {
    const tz = req.session.tz!;
    const companyId = req.params.id
    const periodeQuery = req.query.periode;


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


    const company = await db.Companies.findByPk(companyId, { attributes: ['companyId', 'name', 'coordinate', 'type'] });

    if (!company) return next();

    const indoorNodes = await company.getPrivateNodes();
    const outdoorNodes = await company.getSubscribedNodes({ joinTableAttributes: [] });

    const { tren: indoorTren, averageInThisPeriode: indoorAverage } = await getTrenNodes(indoorNodes, startDate, endDate);
    const { tren: outdoorTren, averageInThisPeriode: outdoorAverage } = await getTrenNodes(outdoorNodes, startDate, endDate);

    
    const reports = await db.Reports.findAll({
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
            model: db.Users,
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


    const eventLogs = await getEventLogsInRange(
        companyId,
        startDate.toDate(),
        endDate.toDate()
    )
        .then((e) => Promise.all(e.map(f => identifyEventStatus(f, tz))));


    calculateEventDuration(eventLogs, tz, { startDate, endDate: endDate });

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


    const result: Summary = {
        meta: {
            company: company.toJSON(),
            startDate: startDate.toDate(),
            endDate: endDate.toDate(),
        },
        averageData: {
            indoor: indoorAverage,
            outdoor: outdoorAverage
        },
        tren: combiningTren(indoorTren, outdoorTren),
        reports: reportSummary,
        eventLogs: eventLogsSummary,
    };

    res.json({
        success: true,
        result
    });
};


async function getAveragedDatalogs(nodes: Nodes[], opt: { startDate: Moment; endDate: Moment; }) {
    const { startDate, endDate } = opt;

    const data = await db.DataLogs.findAll({
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

async function ge2tTrenNodes(nodes: Nodes[], startDate: Moment, endDate: Moment) {
    let isAvaiable = false

    const tz = startDate.tz()!;
    const subtractedStartDate = startDate.clone().subtract(3, 'd');

    // ======================= MENGAMBIL DATALOGS DARI DATABASE ======================= 

    const datalogsFromDB: BasicDataLog[] = await getAveragedDatalogs(nodes, {
        startDate: subtractedStartDate,
        endDate: endDate,
    });

    if (!datalogsFromDB.length) return { isAvaiable, tren: [] }

    // ======================= MENGELOMPOKKAN DATALOGS BERDASARKAN JAM ======================= 

    const countOfHour = endDate.diff(subtractedStartDate, 'h');

    const mapOfDatalogsPerHour = new Map(datalogsFromDB.map(e => [e.datetime.getTime(), e]));

    let datalogsPerHours = Array
        .from({ length: countOfHour }, (_, d) => endDate.clone().subtract(d, 'h').startOf('h').toDate())
        .map(hour => mapOfDatalogsPerHour.get(hour.getTime()) || { datetime: hour, pm25: NaN, pm100: NaN, ch4: NaN, co2: NaN });

    // menghitung data hilang 
    const datalogsPerHourMissingData = datalogsPerHours.filter(e => isNaN(e.pm25)).length / countOfHour;

    if (datalogsPerHourMissingData > MISSING_DATA_TRESHOLD) return null;

    // mengisi data hilang jika ada
    if (datalogsPerHourMissingData) datalogsPerHours = DatalogsLinearImputation(datalogsPerHours);


    // ======================= MENGELOMPOKKAN DATALOGS BERDASARKAN HARI ======================= 

    const mapOfDatalogsPerDay = new Map<number, BasicDataLog[]>();

    datalogsPerHours.forEach(item => {
        const copiedItem = { ...item };
        copiedItem.datetime = moment(copiedItem.datetime).tz(tz).startOf('day').toDate();

        const itemKey = copiedItem.datetime.getTime();
        mapOfDatalogsPerDay.get(itemKey)?.push(copiedItem) || mapOfDatalogsPerDay.set(itemKey, []);
    });

    const countOfDay = endDate.diff(subtractedStartDate, 'd');

    let datalogsPerDay: BasicDataLog[] = Array
        .from({ length: countOfDay }, (_, d) => endDate.clone().subtract(d, 'd').startOf('d').toDate())
        .map(day => ({
            datetime: day,
            pm25: average(mapOfDatalogsPerDay.get(day.getTime())?.map(e => e.pm25) || []),
            pm100: average(mapOfDatalogsPerDay.get(day.getTime())?.map(e => e.pm100) || []),
            co2: average(mapOfDatalogsPerDay.get(day.getTime())?.map(e => e.co2) || []),
            ch4: average(mapOfDatalogsPerDay.get(day.getTime())?.map(e => e.ch4) || []),
        }));

    // menghitung data hilang 
    const datalogsPerDayMapMissingData = datalogsPerDay.filter(e => isNaN(e.pm25)).length / countOfHour;
    if (datalogsPerDayMapMissingData > MISSING_DATA_TRESHOLD) return null;

    // mengisi data hilang jika ada
    if (datalogsPerHourMissingData) datalogsPerDay = DatalogsLinearImputation(datalogsPerDay);

    // ======================= MEMFILTER BERDASARKAN STARTDATE DAN ENDDATE ======================= 
    return datalogsPerDay
        .filter(e => e.pm25 && moment(e.datetime).tz(tz).isBetween(startDate, endDate, undefined, '[]'))
        .map(e => evaluateDatalogs(e));
}


async function getTrenNodes(nodes: Nodes[], startDate: Moment, endDate: Moment) {
    const tz = startDate.tz()!;
    const subtractedStartDate = startDate.clone().subtract(3, 'd');

    let averageInThisPeriode: DataLogWithAnalize | undefined


    // ======================= MENGAMBIL DATALOGS DARI DATABASE ======================= 
    const datalogsFromDB: BasicDataLog[] = await getAveragedDatalogs(nodes, {
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

    const mapOfDatalogsPerDay = new Map<number, BasicDataLog[]>();

    datalogsPerHours.forEach(item => {
        const copiedItem = { ...item };
        copiedItem.datetime = moment(copiedItem.datetime).tz(tz).startOf('day').toDate();

        const itemKey = copiedItem.datetime.getTime();
        mapOfDatalogsPerDay.get(itemKey)?.push(copiedItem) || mapOfDatalogsPerDay.set(itemKey, []);
    });


    // ======================= MENGHITUNG RATA RATA PERHARI =======================

    let datalogsPerDay: BasicDataLog[] = []

    mapOfDatalogsPerDay.forEach((datasInThisDay, day) => {
        const datetime = new Date(day)

        // menghitung data hilang dan mengisi nya dengan linear imputation jika ada 
        const missingData = datasInThisDay.filter(e => isNaN(e.pm25)).length / datasInThisDay.length;

        if (missingData > MISSING_DATA_TRESHOLD) {
            return datalogsPerDay.push({ datetime, pm25: NaN, pm100: NaN, co2: NaN, ch4: NaN });
        }

        if (missingData) datasInThisDay = DatalogsLinearImputation(datasInThisDay);

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

        if (missingData) datalogsPerDay = DatalogsLinearImputation(datalogsPerDay)
        datalogsPerDay = datalogsPerDay.filter(e => e.pm25);

        const valueOfAverageInThisPeriode = {
            datetime: startDate.toDate(),
            pm100: average(datalogsPerDay.map(e => e.pm100)),
            pm25: average(datalogsPerDay.map(e => e.pm25)),
            co2: average(datalogsPerDay.map(e => e.co2)),
            ch4: average(datalogsPerDay.map(e => e.ch4)),
        };

        averageInThisPeriode = evaluateDatalogs(valueOfAverageInThisPeriode, true);
    }

    const tren = datalogsPerDay.filter(e => (
        e.pm25 && moment(e.datetime).tz(tz).isBetween(startDate, endDate, undefined, '[]')
    )).map(e => evaluateDatalogs(e))


    return {
        tren,
        averageInThisPeriode,
    }
}

function evaluateDatalogs(dt: BasicDataLog, withRecomendation = false): DataLogWithAnalize {
    const { datetime, pm100, pm25, ch4, co2 } = dt;

    return {
        datetime,
        ispu: evaluateISPU(pm25, pm100, withRecomendation),
        ch4: evaluateCH4(ch4, withRecomendation),
        co2: evaluateCO2(co2, withRecomendation),
        pm25: pm25,
        pm100: pm100,
    };
}

function calculateAverage(datalogs: BasicDataLog[], date: Moment) {

    const averageValue: BasicDataLog = {
        datetime: date.toDate(),
        pm100: average(datalogs.map(e => e.pm100)),
        pm25: average(datalogs.map(e => e.pm25)),
        co2: average(datalogs.map(e => e.co2)),
        ch4: average(datalogs.map(e => e.ch4)),
    };

    return evaluateDatalogs(averageValue, true);
}




type CombinedTren = {
    datetime: Date;
    indoor?: Omit<DataLogWithAnalize, 'datetime'>;
    outdoor?: Omit<DataLogWithAnalize, 'datetime'>;
};

function combiningTren(indoor: DataLogWithAnalize[] | null, outdoor: DataLogWithAnalize[] | null) {
    const combinedData: { [key: string]: CombinedTren; } = {};

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

