import moment from 'moment-timezone';
import { Op } from 'sequelize';
import DataLogs from '../../models/datalogs.js';
import db from '../../models/index.js';
import Nodes from '../../models/nodes.js';
import { GRKCategorize, ISPUValue, ResultOfMappingNode, ResultOfMultiNodeStats, SingleNodeAnalysis, Timeseries } from '../../types/dashboardData.js';
import { arrayOfHours as arrayOfHoursGenerator, average, calculateMissingData, linearImputationData } from '../../utils/common.utils.js';
import { evaluateCH4, evaluateCO2, evaluateISPU } from './evaluateByConversionTable.js';
import { MISSING_DATA_TRESHOLD } from '../../constants/server.js';


export function analyzingNode(node: Nodes): ResultOfMappingNode {
    const { lastDataSent, dataLogs } = node;

    const ispuDatetime = moment(lastDataSent).startOf('h').toDate()
    const { co2, ch4, pm25, pm100, datetime } = dataLogs.at(0);

    return {
        ...node.toJSON(),
        latestData: {
            ispu: { datetime: ispuDatetime, value: calculateISPU(dataLogs, ispuDatetime, true) },
            ch4: { datetime, value: evaluateCH4(ch4, true) },
            co2: { datetime, value: evaluateCO2(co2, true) },
            pm25: { datetime, value: pm25 },
            pm100: { datetime, value: pm100 },
        }
    };
}

export function identifyAnalyzeType(nodes: ResultOfMappingNode[]) {
    return nodes.length === 1 ? 'single' : nodes.length > 1 ? 'multiple' : 'none'
}

export async function chooseAnalyzeData(nodes: ResultOfMappingNode[], type: ReturnType<typeof identifyAnalyzeType>) {
    return type == 'single' ? await singleNodeAnalysis(nodes[0]) : type == 'multiple' ? multiNodeStatAnalysis(nodes) : null
}

export async function singleNodeAnalysis(nodeAnalysis: ResultOfMappingNode): Promise<SingleNodeAnalysis> {
    let { latestData, nodeId, name, dataLogs, lastDataSent } = nodeAnalysis;
    let { ispu, ch4, co2 } = latestData;


    const tambahan = await db.DataLogs.findAll({
        where: {
            datetime: {
                [Op.lte]: moment(lastDataSent).toDate(),
                [Op.gt]: moment(lastDataSent).subtract(28, 'hour').toDate(),
            },
            nodeId,
        },
        order: [['datetime', 'DESC']]
    });

    dataLogs = dataLogs.concat(tambahan);

    const ispuDatetime = moment(lastDataSent).startOf('h');
    const ispuTren = arrayOfHoursGenerator(ispuDatetime)
        .map((hour) => ({
            datetime: hour,
            value: calculateISPU(dataLogs, hour)
        }));


    return {
        node: {
            name,
            nodeId,
            lastDataSent,
        },
        ispu: { latestData: ispu, tren: ispuTren },
        ch4: { latestData: ch4, tren: dataLogs.map(({ datetime, ch4 }) => ({ datetime, value: evaluateCH4(ch4) })) },
        co2: { latestData: co2, tren: dataLogs.map(({ datetime, co2 }) => ({ datetime, value: evaluateCO2(co2) })) },
    };
}
/**
 * Menentikan Min Max and Average from each value
 */
export function multiNodeStatAnalysis(nodeAnalysis: ResultOfMappingNode[]): ResultOfMultiNodeStats {

    const filterDatalogs = <T>(param: string) => (
        nodeAnalysis.map(({ nodeId, name, latestData, lastDataSent }) => {
            return {
                nodeId,
                name,
                lastDataSent,
                data: latestData[param] as Timeseries<T>
            };
        })
    );

    const ispuOnlyDatalogs = filterDatalogs<[ISPUValue, ISPUValue]>('ispu').filter(e => e.data.value.length)
    const CH4OnlyDatalogs = filterDatalogs<GRKCategorize>('ch4');
    const CO2OnlyDatalogs = filterDatalogs<GRKCategorize>('co2');

    const highestISPU = ispuOnlyDatalogs.reduce((prev, curr) => (
        prev.data.value.at(0).ispuFloat > curr.data.value.at(0).ispuFloat ? prev : curr
    ));

    const lowestISPU = ispuOnlyDatalogs.reduce((prev, curr) => (
        prev.data.value.at(0).ispuFloat < curr.data.value.at(0).ispuFloat ? prev : curr
    ));

    const PM25Average = average(
        ispuOnlyDatalogs.map(e => e.data.value.find(e => e.pollutant == 'PM25').pollutantValue)
    );

    const PM100Average = average(
        ispuOnlyDatalogs.map(e => e.data.value.find(e => e.pollutant == 'PM100').pollutantValue)
    );

    const averageISPU = {
        datetime: ispuOnlyDatalogs[0].data.datetime,
        value: [
            evaluateISPU(PM25Average, 'PM25'),
            evaluateISPU(PM100Average, 'PM100')
        ].sort((a, b) => b.ispuFloat - a.ispuFloat)
    };


    const highestCH4 = CH4OnlyDatalogs
        .reduce((prev, curr) => prev.data.value > curr.data.value ? prev : curr);

    const lowestCH4 = CH4OnlyDatalogs
        .reduce((prev, curr) => prev.data.value > curr.data.value ? prev : curr);

    const averageCH4Value = Math.round(average(CH4OnlyDatalogs.map(e => e.data.value.value)));

    const averageCH4 = {
        datetime: CH4OnlyDatalogs[0].data.datetime,
        value: evaluateCH4(averageCH4Value)
    };


    const highestCO2 = CO2OnlyDatalogs
        .reduce((prev, curr) => prev.data.value > curr.data.value ? prev : curr);

    const lowestCO2 = CO2OnlyDatalogs
        .reduce((prev, curr) => prev.data.value < curr.data.value ? prev : curr);

    const averageCO2Value = Math.round(average(CO2OnlyDatalogs.map(e => e.data.value.value)));

    const averageCO2 = {
        datetime: CO2OnlyDatalogs[0].data.datetime,
        value: evaluateCO2(averageCO2Value)
    };

    return {
        ispu: {
            average: { data: averageISPU },
            highest: highestISPU,
            lowest: lowestISPU,
            list: ispuOnlyDatalogs
        },

        ch4: {
            average: { data: averageCH4 },
            highest: highestCH4,
            lowest: lowestCH4,
            list: CH4OnlyDatalogs
        },
        co2: {
            average: { data: averageCO2 },
            highest: highestCO2,
            lowest: lowestCO2,
            list: CO2OnlyDatalogs
        }
    };
}


export function calculateISPU(dataLogs: DataLogs[], hour: Date, withRecomendation: boolean = false): [ISPUValue, ISPUValue] | [] {
    const arrayOfHours = arrayOfHoursGenerator(moment(hour), 28)

    const datalogsGroupByHours = Array.from({ length: arrayOfHours.length }, () => [] as DataLogs[])

    dataLogs.forEach(dt => {
        const index = arrayOfHours.findIndex(h => moment(h).isSame(moment(dt.datetime).startOf('hour')))
        if (index !== -1) datalogsGroupByHours[index].push(dt)
    })

    const pm25ValuePerHour = datalogsGroupByHours.map(e => average(e.map(f => f.pm100)))
    const pm100ValuePerHour = datalogsGroupByHours.map(e => average(e.map(f => f.pm25)))

    if (calculateMissingData(pm25ValuePerHour.slice(0, 24)) > MISSING_DATA_TRESHOLD) return []


    const PM25Average = average(linearImputationData(pm25ValuePerHour).slice(0, 24));
    const PM100Average = average(linearImputationData(pm100ValuePerHour).slice(0, 24));

    const [highestIspu, lowestIspu] = [
        evaluateISPU(PM25Average, 'PM25', withRecomendation),
        evaluateISPU(PM100Average, 'PM100', withRecomendation)
    ].sort((a, b) => b.ispuFloat - a.ispuFloat)

    return [highestIspu, lowestIspu]
}



