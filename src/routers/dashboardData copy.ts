import Nodes from '../models/nodes.js';
import db from '../models/index.js';
import moment from 'moment';

import { calculateISPU, polutantToISPU } from '../analitic/ISPU.js';
import { average, arrayOfHours as generateArrayOfHours } from '../utils/utils.js';
import { Op } from 'sequelize';
import { GRKtoCategorize } from '../analitic/GRK.js';
import DataLogs from '../models/datalogs.js';
import { DashboardDataType, ResultOfMappingNode, ResultOfMultiNodeStats, SingleNodeAnalysis } from '../types/dashboardData.js';

dashboardData()

export default async function dashboardData(companyId = 1) {

    const companies = await db.Companies.findByPk(companyId, {
        attributes: { exclude: ['description', 'address', 'updatedAt'] }
    });


    const subscribedNodes = await companies.getSubscribedNodes({
        attributes: ['nodeId', 'name', 'coordinate', 'status', 'ownerId', 'lastDataSent'],
        joinTableAttributes: [],
        include: [{
            model: db.DataLogs,
            where: {
                datetime: {
                    [Op.lte]: db.sequelize.col('Nodes.lastDataSent'),
                    [Op.gt]: db.sequelize.literal(`DATE_SUB(Nodes.lastDataSent, INTERVAL 24 HOUR)`)
                }
            },
        }],
        order: [
            [{ model: db.DataLogs, as: 'dataLogs' }, 'datetime', 'DESC'],
        ],
    })

    const mappedNodes = subscribedNodes.map(mappingNode)

    const indoorNodes = mappedNodes
        .filter(({ meta }) => meta.isIndoor && meta.dataIsUptodate)
    const outdoorNodes = mappedNodes
        .filter(({ meta }) => !meta.isIndoor && meta.dataIsUptodate)


    const result: DashboardDataType = {
        companyInfo: {
            ...companies.toJSON(),
            countNodes: {
                indoor: subscribedNodes.filter(e => e.ownerId).length,
                outdoor: subscribedNodes.filter(e => !e.ownerId).length,
            },
        },
        activeNodeCount: {
            indoor: indoorNodes.length,
            outdoor: outdoorNodes.length,
        },
        ispu: {
            indoor: null,
            outdoor: null,
        },
        ch4: {
            indoor: null,
            outdoor: null,
        },
        co2: {
            indoor: null,
            outdoor: null,
        },
        // allNodes: mappedNodes.map(e=> ({dataLogs, CompanySubscriptions, ...r})=>({...r}))
        allNodes: mappedNodes.map(({ node, ...e }) => {
            let { dataLogs, ...n } = node
            return {
                node: { ...n },
                ...e
            }
        })
    }


    if (indoorNodes.length == 1) {
        const { ispu, ch4, co2 } = await singleNodeAnalysis(indoorNodes[0])
        result.ispu.indoor = ispu
        result.ch4.indoor = ch4
        result.co2.indoor = co2

    }

    if (indoorNodes.length > 1) {
        const { ispu, ch4, co2 } = multiNodeStatAnalysis(indoorNodes)
        result.ispu.indoor = ispu
        result.ch4.indoor = ch4
        result.co2.indoor = co2
    }

    if (outdoorNodes.length == 1) {
        const { ispu, ch4, co2 } = await singleNodeAnalysis(outdoorNodes[0])
        result.ispu.outdoor = ispu
        result.ch4.outdoor = ch4
        result.co2.outdoor = co2

    }

    if (outdoorNodes.length > 1) {
        const { ispu, ch4, co2 } = multiNodeStatAnalysis(outdoorNodes)
        result.ispu.outdoor = ispu
        result.ch4.outdoor = ch4
        result.co2.outdoor = co2
    }

    return result
}


/**
 * Mengembalikan data terbaru dari suatu node
 */
function mappingNode(node: Nodes): ResultOfMappingNode {
    const { lastDataSent, dataLogs } = node
    const diffLastDataSentInHours = moment().diff(lastDataSent, 'hour')

    if (!node.lastDataSent || diffLastDataSentInHours > 6) return {
        meta: {
            isIndoor: Boolean(node.ownerId),
            dataIsUptodate: false,
        },
        node: node.toJSON(),
    }

    const currentISPUTime = moment(node.lastDataSent).startOf('h')
    const ISPU = calculateISPU(node.dataLogs, currentISPUTime.toDate())

    const { co2, ch4, pm25, pm100, datetime } = dataLogs.at(0)

    return {
        meta: {
            isIndoor: Boolean(node.ownerId),
            dataIsUptodate: true,
        },
        node: node.toJSON(),
        ispu: ISPU,
        ch4: { datetime, value: GRKtoCategorize(ch4, 'CH4') },
        co2: { datetime, value: GRKtoCategorize(co2, 'CO2') },
        pm25: { datetime, value: pm25 },
        pm100: { datetime, value: pm100 },
    };
}

async function singleNodeAnalysis(nodeAnalysis: ResultOfMappingNode): Promise<SingleNodeAnalysis> {
    let { ispu, ch4, co2, node } = nodeAnalysis
    let { nodeId, name, dataLogs, lastDataSent } = node

    const nodeinfo = { name, nodeId }


    const tambahan = await db.DataLogs.findAll({
        where: {
            datetime: {
                [Op.lte]: moment(lastDataSent).toDate(),
                [Op.gt]: moment(lastDataSent).subtract(25, 'hour').toDate(),
            },
            nodeId,
        },
        order: [['datetime', 'DESC']]
    })

    dataLogs = dataLogs.concat(tambahan)

    const currentISPUTime = moment(lastDataSent).startOf('h')
    const ISPUTren = generateArrayOfHours(currentISPUTime)
        .map((hour) => calculateISPU(dataLogs as DataLogs[], hour))


    return {
        ispu: { node: nodeinfo, current: ispu, tren: ISPUTren },
        ch4: { node: nodeinfo, current: ch4, tren: dataLogs.map(({ datetime, ch4 }) => ({ datetime, value: ch4 })) },
        co2: { node: nodeinfo, current: co2, tren: dataLogs.map(({ datetime, co2 }) => ({ datetime, value: co2 })) },
    }
}

/**
 * Menentikan Min Max and Average from each value
 */
function multiNodeStatAnalysis(nodeAnalysis: ResultOfMappingNode[]): ResultOfMultiNodeStats {
    const deletedDatalogsNodeData = nodeAnalysis.map(({ node, ...r }) => {
        const { name, nodeId } = node
        return {
            node: { name, nodeId },
            ...r
        }
    })

    const ISPUOnlyNodeData = deletedDatalogsNodeData.map(({ node, ispu }) => ({ node, data: ispu }))

    const highestISPU = ISPUOnlyNodeData.reduce((prev, curr) => (
        prev.data.value.at(0).ispuFloat > curr.data.value.at(0).ispuFloat ? prev : curr
    ))

    const lowestISPU = ISPUOnlyNodeData.reduce((prev, curr) => (
        prev.data.value.at(0).ispuFloat < curr.data.value.at(0).ispuFloat ? prev : curr
    ))

    const PM25Average = average(
        ISPUOnlyNodeData.map(e => e.data.value.find(e => e.pollutant == 'PM25').value)
    )
    const PM100Average = average(
        ISPUOnlyNodeData.map(e => e.data.value.find(e => e.pollutant == 'PM100').value)
    )

    const averageISPU = {
        datetime: ISPUOnlyNodeData[0].data.datetime,
        value: [
            polutantToISPU(PM25Average, 'PM25'),
            polutantToISPU(PM100Average, 'PM100')
        ].sort((a, b) => b.ispuFloat - a.ispuFloat)
    }

    const CH4OnlyNodeData = deletedDatalogsNodeData
        .map(({ node, ch4 }) => ({ node, data: ch4 }))

    const highestCH4 = CH4OnlyNodeData
        .reduce((prev, curr) => prev.data.value > curr.data.value ? prev : curr)

    const lowestCH4 = CH4OnlyNodeData
        .reduce((prev, curr) => prev.data.value > curr.data.value ? prev : curr)

    const averageCH4Value = average(CH4OnlyNodeData.map(e => e.data.value.value))

    const averageCH4 = {
        datetime: CH4OnlyNodeData[0].data.datetime,
        value: GRKtoCategorize(averageCH4Value, 'CH4')
    }

    const CO2OnlyNodeData = deletedDatalogsNodeData
        .map(({ node, co2 }) => ({ node, data: co2 }))

    const highestCO2 = CO2OnlyNodeData
        .reduce((prev, curr) => prev.data.value > curr.data.value ? prev : curr)

    const lowestCO2 = CO2OnlyNodeData
        .reduce((prev, curr) => prev.data.value < curr.data.value ? prev : curr)

    const averageCO2Value = average(CO2OnlyNodeData.map(e => e.data.value.value))

    const averageCO2 = {
        datetime: CO2OnlyNodeData[0].data.datetime,
        value: GRKtoCategorize(averageCO2Value, 'CO2')
    }

    return {
        ispu: {
            highest: highestISPU,
            lowest: lowestISPU,
            average: {
                data: averageISPU
            },
            list: ISPUOnlyNodeData
        },

        ch4: {
            highest: highestCH4,
            lowest: lowestCH4,
            average: {
                data: averageCH4
            },
            list: CH4OnlyNodeData

        },
        co2: {
            highest: highestCO2,
            lowest: lowestCO2,
            average: {
                data: averageCO2
            },
            list: CO2OnlyNodeData
        }
    }
}
