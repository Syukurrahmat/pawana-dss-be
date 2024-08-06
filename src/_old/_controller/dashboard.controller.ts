import moment from 'moment';
import db from '../_models/index.js';
import { DashboardDataType, NodeWLastestData } from '../_types/dashboardData.js';

import { Op, literal, where } from 'sequelize';
import { analyzingNode as getLastestData, chooseAnalyzeData, identifyAnalyzeType } from '../_services/decisionLogic/index.js';
import { ControllerType } from '../_types/index.js';

const nodeAttributes = ['nodeId', 'name', 'coordinate', 'companyId', 'lastDataSent', 'isUptodate']
const eventLogAttributes = ['eventLogId', 'companyId', 'name', 'type', 'isCompleted', 'startDate', 'endDate']


export const dashboardDataForCompany: ControllerType = async (req, res, next) => {
    const companyId = req.params.id

    const now = new Date()

    const company = await db.Companies.findByPk(companyId, { attributes: ['companyId', 'managedBy', 'name', 'type', 'coordinate', 'createdAt'] });
    if (!company) return next()

    const companyInformation = company.toJSON()
    const outdoorNodes = await company.getSubscribedNodes({ attributes: nodeAttributes, joinTableAttributes: [] })
    const indoorNodes = await company.getPrivateNodes({ attributes: nodeAttributes })

    const currentEventLogs = await company.getEventLogs({
        attributes: eventLogAttributes,
        where: {
            startDate: { [Op.lte]: now },
            isCompleted : false,
            [Op.or]: [
                { endDate: { [Op.is]: null } },
                { endDate: { [Op.gte]: now } }
            ]
        }
    })

    const nearReports = await db.Reports.findAll({
        where: {
            [Op.and]: [
                { createdAt: { [Op.between]: [moment(now).subtract(1, 'd').toDate(), now] } },
                where(
                    literal(`ST_Distance_Sphere(coordinate, ST_GeomFromText('POINT(${company.coordinate[1]} ${company.coordinate[0]})'))`),
                    { [Op.lte]: 500 }
                )
            ]
        },
        include: [{
            model: db.Users,
            attributes: ['name', 'userId', 'profilePicture']
        }]
    })


    const indoorNodesWLastestData = await Promise.all<NodeWLastestData>(indoorNodes.map(e => getLastestData(e, req.session.tz!)))
    const outdoorNodesWLastestData = await Promise.all<NodeWLastestData>(outdoorNodes.map(e => getLastestData(e, req.session.tz!)))

    const activeIndoorNodes = indoorNodesWLastestData.filter(e => e.latestData)
    const activeOutdoorNodes = outdoorNodesWLastestData.filter(e => e.latestData)

    const indoorAnaliysisType = identifyAnalyzeType(activeIndoorNodes)
    const outdoorAnaliysisType = identifyAnalyzeType(activeOutdoorNodes)

    const indoorData = {
        countNodes: {
            active: activeIndoorNodes.length,
            all: indoorNodes.length,
        },
        analiysisDataType: indoorAnaliysisType,
        data: await chooseAnalyzeData(activeIndoorNodes, req.session.tz!, indoorAnaliysisType),
    }

    const outdoorData = {
        countNodes: {
            active: activeOutdoorNodes.length,
            all: outdoorNodes.length,
        },
        analiysisDataType: outdoorAnaliysisType,
        data: await chooseAnalyzeData(activeOutdoorNodes, req.session.tz!, outdoorAnaliysisType)
    }

    const result: DashboardDataType = {
        dashboardInfo: {
            ...companyInformation,
            countNodes: outdoorNodes.length + indoorNodes.length
        },
        nodes: {
            indoor: indoorNodesWLastestData.map((e) => ({ ...e.toJSON(), latestData: e.latestData })) as any,
            outdoor: outdoorNodesWLastestData.map((e) => ({ ...e.toJSON(), latestData: e.latestData })) as any
        },
        indoor: indoorData,
        outdoor: outdoorData,
        currentEventLogs,
        nearReports
    }

    res.json({
        success: true,
        result: result,
    })
}

export const dashboardDataForRegularUser: ControllerType = async (req, res, next) => {
    const userId = req.params.id

    const user = (await db.Users.findByPk(userId, { attributes: ['userId'] }))!

    const outdoorNodes = await user.getSubscribedNodes({ attributes: nodeAttributes, joinTableAttributes: [] })
    if (!outdoorNodes) return next()

    const analyzedOutdoorNodes = await Promise.all(outdoorNodes.map(e => getLastestData(e, req.session.tz!)))
    const filteredAnalyzedOutdoorNodes = analyzedOutdoorNodes.filter(e => e.latestData) as NodeWLastestData[]
    const outdoorAnaliysisType = identifyAnalyzeType(filteredAnalyzedOutdoorNodes)

    const outdoorData = {
        countNodes: {
            active: filteredAnalyzedOutdoorNodes.length,
            all: outdoorNodes.length,
        },
        analiysisDataType: outdoorAnaliysisType,
        data: await chooseAnalyzeData(filteredAnalyzedOutdoorNodes, req.session.tz!, outdoorAnaliysisType)
    }

    const result: DashboardDataType = {
        dashboardInfo: {
            type: 'regular',
            name: 'Node yang Anda Ikuti',
            countNodes: outdoorNodes.length
        },
        indoor: undefined,
        outdoor: outdoorData,
        nodes: {
            indoor: undefined,
            outdoor: analyzedOutdoorNodes.map((e) => ({ ...e.toJSON(), latestData: e.latestData })) as any

        },
        currentEventLogs: [],
        nearReports: []
    }

    res.json({
        success: true,
        result: result,
    })
}
