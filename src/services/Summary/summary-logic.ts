import { InjectModel } from '@nestjs/sequelize';
import moment, { Moment } from 'moment';
import { Op, col, fn, literal } from 'sequelize';
import { MISSING_DATA_TRESHOLD } from '../../constants/server.js';
import { average } from '../../lib/common.utils.js';
import { datalogsLinearImputation } from '../../lib/missingDataHandler.js';
import DataLogs from '../../models/datalogs.js';
import Nodes from '../../models/nodes.js';
import {
    NodesAverageInsightWithDate,
    SimpleDatalogs,
    TrenItem,
} from '../../types/dashboardData.js';
import { CategorizeValueService } from '../Logic/categorizingValue.service.js';

export class SummaryLogic {
    constructor(
        private DataLogsDB: typeof DataLogs,
        private categorize: CategorizeValueService
    ) {}

    async getAveragedDatalogs(nodes: Nodes[], opt: { startDate: Moment; endDate: Moment }) {
        const { startDate, endDate } = opt;

        const data = await this.DataLogsDB.findAll({
            where: {
                nodeId: { [Op.in]: nodes.map((e) => e.nodeId!) },
                datetime: { [Op.between]: [startDate, endDate] },
            },
            attributes: [
                'datetime',
                [
                    literal(
                        `DATE_FORMAT(DATE_ADD(CONVERT_TZ(datetime, '+00:00', '${startDate.format('Z')}'), INTERVAL 1 HOUR), '%Y-%m-%d %H:00:00')`
                    ),
                    'hour',
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

    async getTrenAndAverageNodes(nodes: Nodes[], startDate: Moment, endDate: Moment) {
        const tz = startDate.tz()!;
        const subtractedStartDate = startDate.clone().subtract(3, 'd');
        let averageInThisPeriode: NodesAverageInsightWithDate | undefined;

        // ======================= MENGAMBIL DATALOGS DARI DATABASE =======================
        const datalogsFromDB: SimpleDatalogs[] = await this.getAveragedDatalogs(nodes, {
            startDate: subtractedStartDate,
            endDate: endDate,
        });

        if (!datalogsFromDB.length) return { averageInThisPeriode, tren: [] };

        // ======================= MENGELOMPOKKAN DATALOGS BERDASARKAN JAM =======================

        const mapOfDatalogsPerHour = new Map(datalogsFromDB.map((e) => [e.datetime.getTime(), e]));
        const countOfHour = endDate.diff(subtractedStartDate, 'h');

        const datalogsPerHours = Array.from({ length: countOfHour }, (_, d) =>
            endDate.clone().subtract(d, 'h').startOf('h').toDate()
        ).map(
            (hour) =>
                mapOfDatalogsPerHour.get(hour.getTime()) || {
                    datetime: hour,
                    pm25: NaN,
                    pm100: NaN,
                    ch4: NaN,
                    co2: NaN,
                }
        );

        // ======================= MENGELOMPOKKAN DATALOGS PER JAM BERDASARKAN HARI =======================

        const mapOfDatalogsPerDay = new Map<number, SimpleDatalogs[]>();

        datalogsPerHours.forEach((item) => {
            const copiedItem = { ...item };
            copiedItem.datetime = moment(copiedItem.datetime).tz(tz).startOf('day').toDate();

            const itemKey = copiedItem.datetime.getTime();
            mapOfDatalogsPerDay.get(itemKey)?.push(copiedItem) ||
                mapOfDatalogsPerDay.set(itemKey, []);
        });

        // ======================= MENGHITUNG RATA RATA PERHARI =======================

        let datalogsPerDay: SimpleDatalogs[] = [];

        mapOfDatalogsPerDay.forEach((datasInThisDay, day) => {
            const datetime = new Date(day);

            // menghitung data hilang dan mengisi nya dengan linear imputation jika ada
            const missingData =
                datasInThisDay.filter((e) => isNaN(e.pm25)).length / datasInThisDay.length;

            if (missingData > MISSING_DATA_TRESHOLD) {
                return datalogsPerDay.push({ datetime, pm25: NaN, pm100: NaN, co2: NaN, ch4: NaN });
            }

            if (missingData) datasInThisDay = datalogsLinearImputation(datasInThisDay);

            datalogsPerDay.push({
                datetime,
                pm25: average(datasInThisDay.map((e) => e.pm25)),
                pm100: average(datasInThisDay.map((e) => e.pm100)),
                co2: average(datasInThisDay.map((e) => e.co2)),
                ch4: average(datasInThisDay.map((e) => e.ch4)),
            });
        });

        const missingData =
            datalogsPerDay.filter((e) => isNaN(e.pm25)).length / datalogsPerDay.length;

        if (missingData <= MISSING_DATA_TRESHOLD) {
            if (missingData) datalogsPerDay = datalogsLinearImputation(datalogsPerDay);
            datalogsPerDay = datalogsPerDay.filter((e) => e.pm25);

            const valueOfAverageInThisPeriode = {
                datetime: startDate.toDate(),
                pm100: average(datalogsPerDay.map((e) => e.pm100)),
                pm25: average(datalogsPerDay.map((e) => e.pm25)),
                co2: average(datalogsPerDay.map((e) => e.co2)),
                ch4: average(datalogsPerDay.map((e) => e.ch4)),
            };

            averageInThisPeriode = this.categorizeDatalog(valueOfAverageInThisPeriode, true);
        }

        const tren = datalogsPerDay
            .filter(
                (e) =>
                    e.pm25 &&
                    moment(e.datetime).tz(tz).isBetween(startDate, endDate, undefined, '[]')
            )
            .map((e) => this.categorizeDatalog(e));

        return {
            tren,
            averageInThisPeriode,
        };
    }

    categorizeDatalog(dt: SimpleDatalogs, withRecomendation = false): NodesAverageInsightWithDate {
        const { datetime, pm100, pm25, ch4, co2 } = dt;

        return {
            datetime,
            ispu: this.categorize.ISPU(pm25, pm100, withRecomendation),
            ch4: this.categorize.CH4(ch4, withRecomendation),
            co2: this.categorize.CO2(co2, withRecomendation),
            pm25: pm25,
            pm100: pm100,
        };
    }

    calculateAverage(datalogs: SimpleDatalogs[], date: Moment) {
        const averageValue: SimpleDatalogs = {
            datetime: date.toDate(),
            pm100: average(datalogs.map((e) => e.pm100)),
            pm25: average(datalogs.map((e) => e.pm25)),
            co2: average(datalogs.map((e) => e.co2)),
            ch4: average(datalogs.map((e) => e.ch4)),
        };

        return this.categorizeDatalog(averageValue, true);
    }

    combiningTren(
        indoor: NodesAverageInsightWithDate[] | null,
        outdoor: NodesAverageInsightWithDate[] | null
    ) {
        const combinedData: Record<string, TrenItem> = {};

        indoor?.forEach((entry) => {
            const { datetime, ...value } = entry;
            const key = datetime.toISOString();

            if (!combinedData[key]) combinedData[key] = { datetime };
            combinedData[key].indoor = value;
        });

        outdoor?.forEach((entry) => {
            const { datetime, ...value } = entry;
            const key = datetime.toISOString();

            if (!combinedData[key]) combinedData[key] = { datetime };
            combinedData[key].outdoor = value;
        });

        return Object.values(combinedData);
    }
}
