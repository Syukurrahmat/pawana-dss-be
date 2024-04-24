import Groups from '../models/groups.js';
import Nodes from '../models/nodes.js';
import db from '../models/index.js';
import moment from 'moment';

import { calculateISPU } from '../analitic/ISPU.js';
import { arrayOfHours, average, sortBytime } from '../utils/utils.js';
import { InferAttributes, Op } from 'sequelize';
import { calculateCH4, calculateCO2 } from '../analitic/GRK.js';
import { calculateHum, calculateTemp } from '../analitic/tempHum.js';
import DataLogs from '../models/datalogs.js';

export default async function dashboardData() {
    const group: InferAttributes<Groups, { omit: any }> = await db.Groups.findByPk(4, {
        attributes: ['groupId', 'name', 'address'],
        include: [
            {
                model: db.Users,
                attributes: ['name'],
                through: {
                    where: { permission: 'manager' },
                    attributes: ['userId'],
                },
            },
            {
                model: db.Nodes,
                attributes: {
                    exclude: ['groupId', 'description', 'apiKey', 'createdAt', 'updatedAt'],
                },
                include: {
                    // @ts-ignore
                    model: db.DataLogs,
                    where: {
                        datetime: {
                            [Op.lte]: moment().toDate(),
                            [Op.gt]: moment().subtract(1, 'd').toDate(),
                        },
                    },
                },
            },
        ],
    }).then((e) => e.toJSON());

    group.nodes.map((node) => node.data.sort(sortBytime));

    // ==============================
    const groupInfo = {
        name: group.name,
        groupId: group.groupId,
        address: group.address,
        manager: {
            name: group.users[0].name,
            userId: group.users[0].GroupPermissions.userId,
        },
        nodeCount: group.nodes.length,
        nodes: group.nodes.map((e) => {
            return {
                ...e,
                data: e.data.at(0),
            };
        }),
    };

    // ==============================
    const indoorNode = group.nodes.find((e) => e.environment == 'indoor');
    const outdoorNodes = group.nodes.filter((e) => e.environment == 'outdoor');

    const dashboardData = {
        indoor: await oneNodeDetail(indoorNode),
        outdoor:
            outdoorNodes.length == 1
                ? await oneNodeDetail(outdoorNodes[0])
                : multipleNodeDetail(outdoorNodes),
    };

    return {
        groupInfo,
        dashboardData,
    };
}

async function oneNodeDetail(node: Nodes) {
    const extraDataLogs: DataLogs[] = await db.DataLogs.findAll({
        where: {
            nodeId: node.nodeId,
            datetime: {
                [Op.lte]: moment().subtract(1, 'd').toDate(),
                [Op.gt]: moment().subtract(55, 'hours').toDate(),
            },
        },
    }).then((e) => e.map((f) => f.toJSON()));

    node.data.push(...extraDataLogs);
    node.data.sort(sortBytime);

    const ispu24h = arrayOfHours()
        .map((hour) => calculateISPU(node.data, hour))
        .sort(sortBytime);

    const { pm100, pm25, datetime: ISPUdatetime } = ispu24h.at(0);

    const mainPollutantName = pm25.ispuFloat > pm100.ispuFloat ? 'PM2.5' : 'PM10';
    const mainPollutantData = mainPollutantName == 'PM2.5' ? pm25 : pm100;

    const currentData = node.data.at(0);

    return {
        ispu: {
            datetime: ISPUdatetime,
            currentISPU: {
                mainPollutant: mainPollutantName,
                ...mainPollutantData,
            },
            allCurrentISPU: { pm25, pm100 },
            ISPUTren: ispu24h,
        },
        grk: {
            datetime: currentData.datetime,
            currentGRK: {
                ch4: calculateCH4(currentData.ch4),
                co2: calculateCH4(currentData.co2),
            },
        },
        tempHum: {
            datetime: currentData.datetime,
            currentTempHum: {
                temp: calculateTemp(currentData.temperature),
                hum: calculateTemp(currentData.humidity),
            },
        },
        tren: node.data.map(({ nodeId, dataLogId, ...dt }) => dt),
    };
}

function multipleNodeDetail(nodes: Nodes[]) {
    const ispuTime = moment().startOf('h').toDate();

    const ispuAverage = calculateISPU(
        nodes.flatMap((e) => e.data),
        ispuTime
    );

    const ispuPerNode = nodes.map(({ nodeId, name, data }) => {
        const { pm100, pm25, datetime: ISPUdatetime } = calculateISPU(data, ispuTime);
        const mainPollutantName = pm25.ispuFloat > pm100.ispuFloat ? 'PM2.5' : 'PM10';
        const mainPollutantData = mainPollutantName == 'PM2.5' ? pm25 : pm100;

        return {
            nodeId,
            name,
            ispu: {
                datetime: ISPUdatetime,
                currentISPU: {
                    mainPollutant: mainPollutantName,
                    ...mainPollutantData,
                },
                allCurrentISPU: { pm25, pm100 },
            },
        };
    });

    ispuPerNode.sort((a, b) => b.ispu.currentISPU.ispuFloat - a.ispu.currentISPU.ispuFloat);

    const highestIspuNode = ispuPerNode.at(0);
    const lowestIspuNode = ispuPerNode.at(-1);

    const ispu = {
        ispuPerNode: ispuPerNode,
        average: ispuAverage,
        highest: highestIspuNode,
        loweresr: lowestIspuNode,
    };

    const currNodeData = nodes.map(({ name, nodeId, data }) => {
        const { dataLogId, nodeId: _, ...restData } = data.at(0);
        return {
            name,
            nodeId,
            data: restData,
        };
    });

    const ch4Average = average(currNodeData.map((e) => e.data.ch4));
    const co2Average = average(currNodeData.map((e) => e.data.co2));
    const tempAverage = average(currNodeData.map((e) => e.data.temperature));
    const humAverage = average(currNodeData.map((e) => e.data.humidity));

    const dataSortedByCo2 = currNodeData.sort((a, b) => b.data.co2 - a.data.co2);
    const dataSortedByCh4 = currNodeData.sort((a, b) => b.data.ch4 - a.data.ch4);

    const highestCo2Node = dataSortedByCo2.at(0);
    const lowerestCo2Node = dataSortedByCo2.at(-1);

    const highestCh4Node = dataSortedByCh4.at(0);
    const lowerestCh4Node = dataSortedByCh4.at(-1);

    const grk = {
        nodes: currNodeData,
        ch4: {
            average: calculateCH4(ch4Average),
            highest: {
                nodeId: highestCh4Node.nodeId,
                name: highestCh4Node.name,
                ...calculateCH4(highestCh4Node.data.ch4),
            },
            lowerest: {
                nodeId: lowerestCh4Node.nodeId,
                name: lowerestCh4Node.name,
                ...calculateCH4(lowerestCh4Node.data.ch4),
            },
        },
        co2: {
            average: calculateCO2(co2Average),
            highest: {
                nodeId: highestCo2Node.nodeId,
                name: highestCo2Node.name,
                ...calculateCO2(highestCo2Node.data.co2),
            },
            lowerest: {
                nodeId: lowerestCo2Node.nodeId,
                name: lowerestCo2Node.name,
                ...calculateCO2(lowerestCo2Node.data.co2),
            },
        },
    };

    const temHum = {
        temp: {
            average: calculateTemp(tempAverage),
        },
        hum: {
            average: calculateHum(humAverage),
        },
    };

    console.log(temHum);

    return {
        ispu,
        grk,
        temHum,
    };
}
