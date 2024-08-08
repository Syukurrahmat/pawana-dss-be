import moment, { Moment } from 'moment';
import { Op, col, fn, literal } from 'sequelize';
import Nodes from '../../models/nodes.js';
import { arrayOfObjectHours, average, sortByDatetime } from '../../lib/common.utils.js';
import { fillMissingData } from './missingDataHandler.js';
import { categorizeCH4, categorizeCO2, categorizeISPU } from './evaluateByConversionTable.js';
import { Injectable } from '@nestjs/common';
import { GRKValue, ISPUValue, MultiNodeInsight, NodeWithLatestData, SingleNodeInsight, Timeseries } from '../../types/dashboardData.js';

type PMDatalogs = {
    datetime: Date;
    pm100: number;
    pm25: number;
}

@Injectable()
export class LogicService {
    async getLatestData(node: Nodes, tz: string): Promise<NodeWithLatestData> {
        const { lastDataSent, isUptodate } = node;
        const result: NodeWithLatestData = node

        if (!isUptodate) return result

        const lastDataLogs = await node.getDataLogs({
            order: [['datetime', 'DESC']],
            limit: 1
        })

        if (!lastDataLogs.length) return result

        const { ch4, co2, pm25, pm100, datetime } = lastDataLogs[0]
        const ispuHour = moment(lastDataSent).tz(tz).startOf('h')

        const PMData = await this.getPMData(node, {
            startDate: ispuHour.clone().subtract(28, 'h'),
            endDate: ispuHour,
        })

        result.PMDatalogs = {
            ispuHour, tren: PMData
        }

        result.latestData = {
            ispu: { datetime: ispuHour.toDate(), value: calculateISPU(PMData, ispuHour, true, true) },
            ch4: { datetime, value: categorizeCH4(ch4, true) },
            co2: { datetime, value: categorizeCO2(co2, true) },
            pm25: { datetime, value: pm25 },
            pm100: { datetime, value: pm100 },
        }

        return result
    }

    async getPMData(node: Nodes, opt: { startDate: Moment, endDate: Moment }) {
        const { startDate, endDate } = opt

        const data = await node.getDataLogs({
            where: {
                nodeId: node.nodeId,
                datetime: { [Op.between]: [startDate.toDate(), endDate.toDate()] }
            },
            attributes: [
                [
                    literal(`DATE_FORMAT(DATE_ADD(CONVERT_TZ(datetime, '+00:00', '${startDate.format('Z')}'), INTERVAL 1 HOUR), '%Y-%m-%d %H:00:00')`),
                    'hour'
                ],
                [fn('AVG', col('pm25')), 'pm25'],
                [fn('AVG', col('pm100')), 'pm100'],
            ],
            group: [col('hour')],
            order: [['datetime', 'DESC']],
        })

        return data.map(({ dataValues: { pm100, pm25, hour } }) => ({
            datetime: moment.tz(hour!, startDate.tz()!).toDate(),
            pm100,
            pm25
        }))
    }


    async singleNodeAnalysis(node: NodeWithLatestData, tz: string): Promise<SingleNodeInsight | null> {
        let { nodeId, name, lastDataSent, PMDatalogs, latestData } = node;
        let { ispuHour, tren: PMDatalogsTren } = PMDatalogs!;
        let { ispu, ch4, co2 } = latestData!;

        const lastDataSentMoment = moment(lastDataSent).tz(tz)

        const datalogs = await node.getDataLogs({
            where: {
                datetime: {
                    [Op.between]: [
                        lastDataSentMoment.clone().subtract(48, 'hour').toDate(),
                        lastDataSentMoment.toDate(),
                    ],
                }
            },
            order: [['datetime', 'DESC']],
        })

        const ch4Tren = datalogs.map(({ datetime, ch4 }) => ({ datetime, value: categorizeCH4(ch4) }))
        const co2Tren = datalogs.map(({ datetime, co2 }) => ({ datetime, value: categorizeCO2(co2) }))

        await this.getPMData(node, {
            startDate: ispuHour.clone().subtract(52, 'h'),
            endDate: ispuHour.clone().subtract(28, 'h').subtract(1, 'second'),
        }).then(e => PMDatalogsTren.push(...e))

        const ispuTren = arrayOfObjectHours(ispuHour)
            .map(({ datetime }) => ({
                datetime: datetime.toDate(),
                value: calculateISPU(PMDatalogsTren, datetime)
            }));

        return {
            node: {
                name,
                nodeId: nodeId!,
                lastDataSent: lastDataSent!,
            },
            ispu: { latestData: ispu, tren: ispuTren },
            ch4: { latestData: ch4, tren: ch4Tren },
            co2: { latestData: co2, tren: co2Tren },
        };
    }

    multiNodeStatAnalysis(nodeAnalysis: NodeWithLatestData[]): MultiNodeInsight {
        const filterDatalogs = <T>(param: string) => (
            nodeAnalysis.map(({ nodeId, name, latestData, lastDataSent }) => ({
                nodeId: nodeId!,
                name: name!,
                lastDataSent: lastDataSent!,
                data: latestData![param] as Timeseries<T>
            }))
        );

        const ispuOnlyDatalogs = filterDatalogs<ISPUValue>('ispu').filter(e => e.data.value)
        const CH4OnlyDatalogs = filterDatalogs<GRKValue>('ch4');
        const CO2OnlyDatalogs = filterDatalogs<GRKValue>('co2');


        const highestISPU = ispuOnlyDatalogs.reduce((prev, curr) => (
            (prev.data.value?.[0].ispuFloat || 0) > (curr.data.value?.[0].ispuFloat || 0) ? prev : curr
        ));

        const lowestISPU = ispuOnlyDatalogs.reduce((prev, curr) => (
            (prev.data.value?.[0].ispuFloat || 0) < (curr.data.value?.[0].ispuFloat || 0) ? prev : curr
        ));

        const PM25Average = average(ispuOnlyDatalogs.map(e => e.data.value?.find(e => e.pollutant == 'PM25')?.pollutantValue || NaN));
        const PM100Average = average(ispuOnlyDatalogs.map(e => e.data.value?.find(e => e.pollutant == 'PM100')?.pollutantValue || NaN));

        const averageISPU = {
            datetime: ispuOnlyDatalogs[0].data.datetime,
            value: categorizeISPU(PM25Average, PM100Average, true),
        };

        const highestCH4 = CH4OnlyDatalogs.reduce((prev, curr) => prev.data.value.value > curr.data.value.value ? prev : curr);
        const lowestCH4 = CH4OnlyDatalogs.reduce((prev, curr) => prev.data.value.value < curr.data.value.value ? prev : curr);
        const averageCH4Value = Math.round(average(CH4OnlyDatalogs.map(e => e.data.value.value)));

        const averageCH4 = {
            datetime: CH4OnlyDatalogs[0].data.datetime,
            value: categorizeCH4(averageCH4Value, true)
        };

        const highestCO2 = CO2OnlyDatalogs
            .reduce((prev, curr) => prev.data.value.value > curr.data.value.value ? prev : curr);

        const lowestCO2 = CO2OnlyDatalogs
            .reduce((prev, curr) => prev.data.value.value < curr.data.value.value ? prev : curr);

        const averageCO2Value = Math.round(average(CO2OnlyDatalogs.map(e => e.data.value.value)));

        const averageCO2 = {
            datetime: CO2OnlyDatalogs[0].data.datetime,
            value: categorizeCO2(averageCO2Value, true)
        };

        return {
            ispu: {
                average: { data: averageISPU },
                highest: highestISPU,
                lowest: lowestISPU,
            },

            ch4: {
                average: { data: averageCH4 },
                highest: highestCH4,
                lowest: lowestCH4,
            },
            co2: {
                average: { data: averageCO2 },
                highest: highestCO2,
                lowest: lowestCO2,
            },

        };
    }


    calculateISPU(pmDatalogs: PMDatalogs[], ispuHour: moment.Moment, withRecomendation: boolean = false, c: boolean = false): [ISPUDetailValue, ISPUDetailValue] | null {
        const pmDatalogsMap = new Map(pmDatalogs.map(e => [e.datetime.getTime(), e]))


        const datalogsPerHour = Array
            .from({ length: 24 }, (_, i) => ispuHour.clone().startOf('h').subtract(i, 'h').toDate())
            .map(hour => pmDatalogsMap.get(hour.getTime()) || { datetime: hour, pm100: NaN, pm25: NaN })
            .sort(sortByDatetime)


        const pm25PerHour = fillMissingData(datalogsPerHour.map(e => e.pm25))
        const pm100PerHour = fillMissingData(datalogsPerHour.map(e => e.pm100))


        if (!(pm25PerHour && pm100PerHour)) return null

        const PM25Average = average(pm25PerHour.slice(0, 24));
        const PM100Average = average(pm100PerHour.slice(0, 24));

        return categorizeISPU(PM25Average, PM100Average, withRecomendation)
    }

    identifyAnalyzeType(nodes: NodeWithLatestData[]) {
        return nodes.length === 1 ? 'single' : nodes.length > 1 ? 'multiple' : 'none'
    }

    async chooseAnalyzeData(nodes: NodeWithLatestData[], tz: string, type: ReturnType<typeof this.identifyAnalyzeType>) {
        return type == 'single'
            ? await this.singleNodeAnalysis(nodes[0], tz)
            : type == 'multiple' ? this.multiNodeStatAnalysis(nodes)
                : null
    }
}