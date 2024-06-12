import { Router } from 'express';
import moment, { Moment } from 'moment';
import db from '../../models/index.js';
import { ControllerType } from '../../types/index.js';
import Nodes from '../../models/nodes.js';
import { average, calculateMissingData, groupByInterval, linearImputationData, printJSON } from '../../utils/common.utils.js';
import { Op, Order, OrderItem, where } from 'sequelize';
import DataLogs from '../../models/datalogs.js';
import { MISSING_DATA_TRESHOLD } from '../../constants/server.js';
import { calculateISPU } from '../../services/decisionLogic/index.js';
import { evaluateCH4, evaluateCO2, evaluateISPU } from '../../services/decisionLogic/evaluateByConversionTable.js';
import { GRKCategorize, ISPUValue } from '../../types/dashboardData.js';

const summaryRouter = Router();


type BasicDataLog = {
    datetime: Date;
    pm25: number;
    pm100: number;
    ch4: number;
    co2: number;
}

type DataLogWithAnalize = {
    datetime: Date;
    ispu: [ISPUValue, ISPUValue] | [];
    co2: GRKCategorize;
    ch4: GRKCategorize;
    pm25: number;
    pm100: number;
}

const createDaysHoursStructure = (month: Moment) =>
    Array.from({ length: month.daysInMonth() }, (_, d) => {
        const day = month.clone().add(d, 'day').startOf('day')

        return {
            day: day,
            hours: Array.from({ length: 24 }, (_, h) => ({
                hour: day.clone().add(h, 'hour'),
                datalogs: [] as DataLogs[],
            })),
        }
    });


const averagingNodeDataPerDay = (month: Moment, node: Nodes): BasicDataLog[] => {
    if (!node.dataLogs.length) return []

    const dailyDataStructureHelper = createDaysHoursStructure(month)


    // Mengisi Struktur dengan DataLogs
    node.dataLogs.forEach(datalog => {
        const day = moment(datalog.datetime).startOf('day')
        const hour = moment(datalog.datetime).startOf('hour')

        dailyDataStructureHelper
            .find(e => e.day.isSame(day))?.hours
            .find(e => e.hour.isSame(hour))?.datalogs
            .push(datalog)
    });


    const averagePerDays = dailyDataStructureHelper.map(day => {
        // Menghitung Rata Rata Perjam
        const averagePerHour = day.hours.map((hour, i) => {
            const datetime = hour.hour.toDate()

            return {
                datetime,
                pm25: average(hour.datalogs.map(e => e.pm25)),
                pm100: average(hour.datalogs.map(e => e.pm100)),
                ch4: average(hour.datalogs.map(e => e.ch4)),
                co2: average(hour.datalogs.map(e => e.co2)),
            }
        })

        const missingData = averagePerHour.filter(e => isNaN(e.pm25)).length

        if (missingData / 24 > MISSING_DATA_TRESHOLD) return {
            datetime: day.day.toDate(),
            pm25: null,
            pm100: null,
            co2: null,
            ch4: null,
        }

        const pm25ValuesPerHour = averagePerHour.map(e => e.pm25)
        const pm100ValuesPerHour = averagePerHour.map(e => e.pm100)
        const co2ValuesPerHour = averagePerHour.map(e => e.co2)
        const ch4ValuesPerHour = averagePerHour.map(e => e.ch4)

        const pm25Value = average(missingData ? linearImputationData(pm25ValuesPerHour) : pm25ValuesPerHour)
        const pm100Value = average(missingData ? linearImputationData(pm100ValuesPerHour) : pm100ValuesPerHour)
        const co2Value = average(missingData ? linearImputationData(co2ValuesPerHour) : co2ValuesPerHour)
        const ch4Value = average(missingData ? linearImputationData(ch4ValuesPerHour) : ch4ValuesPerHour)


        const averageInThisDay = {
            datetime: day.day.toDate(),
            pm25: pm25Value,
            pm100: pm100Value,
            co2: ch4Value,
            ch4: co2Value,
        }
        return averageInThisDay
    })

    return averagePerDays
}


const getDetailDesicionOfArray = (datalogs: BasicDataLog[]): DataLogWithAnalize[] => {
    if (!datalogs.length) return []
    console.log('================')
    return datalogs.map(({ datetime, pm100, pm25, ch4, co2 }) => {
        console.log(datetime, pm100, pm25, ch4, co2)
        return {
            datetime,
            ispu: [
                evaluateISPU(pm25, 'PM25'),
                evaluateISPU(pm100, 'PM100')
            ].sort((a, b) => b.ispuFloat - a.ispuFloat) as [ISPUValue, ISPUValue],
            co2: evaluateCH4(ch4),
            ch4: evaluateCO2(co2),
            pm25: pm25,
            pm100: pm100,
        }
    })
}


const averagingAllNodes = (averagedNodeDatas: BasicDataLog[][]) => {
    if (averagedNodeDatas.length == 0) return []
    if (averagedNodeDatas.length == 1) return getDetailDesicionOfArray(averagedNodeDatas[0])

    const data = averagedNodeDatas.flatMap(e => e)

    const totals = data.reduce((acc, item) => {
        const dateKey = item.datetime.toISOString()

        if (!acc[dateKey]) {
            acc[dateKey] = { pm25: 0, pm100: 0, co2: 0, ch4: 0, count: 0 };
        }

        acc[dateKey].pm25 += item.pm25;
        acc[dateKey].pm100 += item.pm100;
        acc[dateKey].co2 += item.co2;
        acc[dateKey].ch4 += item.ch4;
        acc[dateKey].count += 1;

        return acc;
    }, {});

    const averagePerDay: BasicDataLog[] = Object.keys(totals).map(dateKey => ({
        datetime: new Date(dateKey),
        pm25: totals[dateKey].pm25 / totals[dateKey].count,
        pm100: totals[dateKey].pm100 / totals[dateKey].count,
        co2: totals[dateKey].co2 / totals[dateKey].count,
        ch4: totals[dateKey].ch4 / totals[dateKey].count,
    })).filter(e=> e.pm25 !== 0 || e.ch4 !== 0 || e.co2 !== 0 ||e.ch4 !== 0 || e.pm100 !== 0 )


    return getDetailDesicionOfArray(averagePerDay)
}


const calculateAveragePerMonth = (d: DataLogWithAnalize[]) => {
    const pm25Average = average(d.map(e => e.pm25))
    const pm100Average = average(d.map(e => e.pm100))
    const co2Average = average(d.map(e => e.co2.value))
    const ch4Average = average(d.map(e => e.ch4.value))

    return {
        ispu: [
            evaluateISPU(pm25Average, 'PM25'),
            evaluateISPU(pm100Average, 'PM100')
        ].sort((a, b) => b.ispuFloat - a.ispuFloat) as [ISPUValue, ISPUValue],
        co2: evaluateCH4(ch4Average),
        ch4: evaluateCO2(co2Average),
        pm25: pm25Average,
        pm100: pm100Average,
    }

}

const getMonthlySummary: ControllerType = async (req, res, next) => {

    const monthQuery = req.query.month as string
    const startOfMonth = moment(monthQuery, 'YYYY-MM', true).isValid() ? moment(monthQuery) : moment().startOf('day').subtract(1, 'month')
    const endOfMonth = startOfMonth.clone().add(1, 'month').subtract(1, 'd')

    const includeDatalogs = {
        model: db.DataLogs,
        required: false,
        where: {
            datetime: { [Op.between]: [startOfMonth.toDate(), endOfMonth.toDate()] }
        },
    }

    const orderDatalogs: OrderItem = [{ model: db.DataLogs, as: 'dataLogs' }, 'datetime', 'DESC']

    const { companyId } = req.session.activeCompany
    const company = await db.Companies.findByPk(companyId)

    const indoorNodes = await company.getPrivateNodes({
        include: [includeDatalogs],
        order: [orderDatalogs]
    })

    const outdoorNodes = await company.getSubscribedNodes({
        include: [includeDatalogs],
        order: [orderDatalogs],
        joinTableAttributes: []
    })

    const indoorNodesAveragedData = indoorNodes.map(nodes => averagingNodeDataPerDay(startOfMonth, nodes))
    const outdoorNodesAveragedData = outdoorNodes.map(nodes => averagingNodeDataPerDay(startOfMonth, nodes))


    const outdoorNodeTren = averagingAllNodes(outdoorNodesAveragedData)
    const indoorNodeTren = averagingAllNodes(indoorNodesAveragedData)

    const indoorAverage = calculateAveragePerMonth(indoorNodeTren)
    const outdoorAverage = calculateAveragePerMonth(outdoorNodeTren)


    const reportInThisMonth = await db.Reports.findAll({
        where: {
            [Op.and]: [
                { createdAt: { [Op.between]: [startOfMonth.toDate(), endOfMonth.toDate()] } },
                db.sequelize.where(
                    db.sequelize.fn(
                        'ST_Distance_Sphere',
                        db.sequelize.col('coordinate'),
                        db.sequelize.fn('ST_GeomFromText', `POINT(${company.coordinate[1]} ${company.coordinate[0]})`)
                    ),
                    { [Op.lte]: 500 }
                )
            ]
        },

    })

    const eventLogsInThisMonth = await db.EventLogs.findAll({
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
        result: {
            averageData: {
                indoor: indoorAverage,
                outdoor: outdoorAverage
            },
            tren: {
                indoor: indoorNodeTren,
                outdoor: outdoorNodeTren,
            },
            reports: reportInThisMonth,
            event: eventLogsInThisMonth,
        }
    })
}




summaryRouter.get('/monthly', getMonthlySummary)

export default summaryRouter;
