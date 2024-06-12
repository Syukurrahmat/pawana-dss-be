import moment from 'moment';
import db from '../models/index.js';
import { DashboardDataType } from '../types/dashboardData.js';

import { Op, Order } from 'sequelize';
import { analyzingNode, chooseAnalyzeData, identifyAnalyzeType } from '../services/decisionLogic/index.js';
import { ControllerType } from '../types/index.js';

const nodeAttributes = ['nodeId', 'name', 'coordinate', 'status', 'companyId', 'lastDataSent', 'isUptodate']
const eventLogAttributes = ['eventLogId', 'companyId', 'name', 'type', 'isCompleted', 'startDate', 'endDate']
const order: Order = [[{ model: db.DataLogs, as: 'dataLogs' }, 'datetime', 'DESC']]
const includeDatalogs = {
    model: db.DataLogs,
    where: {
        datetime: {
            [Op.lte]: db.sequelize.col('Nodes.lastDataSent'),
            [Op.gt]: db.sequelize.literal(`DATE_SUB(Nodes.lastDataSent, INTERVAL 24 HOUR)`)
        }
    },
    required: false
}

export const dashboardDataForManagerUser: ControllerType = async (req, res, next) => {
    const now = new Date()
    const { companyId } = req.session.activeCompany

    const company = await db.Companies.findByPk(companyId, { attributes: ['companyId', 'managedBy', 'name', 'type', 'coordinate'] });
    const companyInformation = company.toJSON()

    const outdoorSubscribedNodes = await company.getSubscribedNodes({
        attributes: nodeAttributes,
        joinTableAttributes: [],
        include: [includeDatalogs],
        order
    })

    const indoorOwnedNodes = await company.getPrivateNodes({
        attributes: nodeAttributes,
        include: [includeDatalogs],
        order
    })

    const currentEventLogs = await company.getEventLogs({
        attributes: eventLogAttributes,
        where: {
            startDate: { [Op.lte]: now },
            [Op.or]: [{ endDate: { [Op.is]: null } }, { endDate: { [Op.gte]: now } }]
        }
    })

    const nearReports = await db.Reports.findAll({
        where: {
            [Op.and]: [
                { createdAt: { [Op.between]: [moment(now).subtract(1, 'd').toDate(), now] } },
                db.sequelize.where(
                    db.sequelize.fn(
                        'ST_Distance_Sphere',
                        db.sequelize.col('coordinate'),
                        db.sequelize.fn('ST_GeomFromText', `POINT(${company.coordinate[1]} ${company.coordinate[0]})`)
                    ),
                    { [Op.lte]: 500 }
                )]
        },
        include: [{
            model: db.Users,
            attributes: ['name', 'userId', 'profilePicture']
        }]
    })


    const indoorNodeAnalized = indoorOwnedNodes.filter(e => e.isUptodate).map(analyzingNode)
    const outdoorNodeAnalized = outdoorSubscribedNodes.filter(e => e.isUptodate).map(analyzingNode)

    const indoorAnaliysisType = identifyAnalyzeType(indoorNodeAnalized)
    const outdoorAnaliysisType = identifyAnalyzeType(outdoorNodeAnalized)

    const indoorData = {
        countNodes: {
            active: indoorNodeAnalized.length,
            all: indoorOwnedNodes.length,
        },
        analiysisDataType: indoorAnaliysisType,
        data: await chooseAnalyzeData(indoorNodeAnalized, indoorAnaliysisType),
    }


    const outdoorData = {
        countNodes: {
            active: outdoorNodeAnalized.length,
            all: outdoorSubscribedNodes.length,
        },
        analiysisDataType: outdoorAnaliysisType,
        data: await chooseAnalyzeData(outdoorNodeAnalized, outdoorAnaliysisType)
    }

    const result: DashboardDataType = {
        dashboardInfo: {
            ...companyInformation,
            countNodes: outdoorSubscribedNodes.length + indoorOwnedNodes.length
        },
        indoor: indoorData,
        outdoor: outdoorData,
        nodes: outdoorNodeAnalized.map(({ dataLogs, ...n }) => ({ ...n })),
        currentEventLogs,
        nearReports
    }

    res.json({
        success: true,
        result: result,
    })
}

export const dashboardDataForRegularUser: ControllerType = async (req, res, next) => {
    const outdoorSubscribedNodes = await req.user.getSubscribedNodes({
        attributes: nodeAttributes,
        joinTableAttributes: [],
        include: [includeDatalogs],
        order
    })

    const outdoorNodeAnalized = outdoorSubscribedNodes.filter(e => e.isUptodate).map(analyzingNode)
    const outdoorAnaliysisType = identifyAnalyzeType(outdoorNodeAnalized)


    const outdoorData = {
        countNodes: {
            active: outdoorNodeAnalized.length,
            all: outdoorSubscribedNodes.length,
        },
        analiysisDataType: outdoorAnaliysisType,
        data: await chooseAnalyzeData(outdoorNodeAnalized, outdoorAnaliysisType)
    }

    const result: DashboardDataType = {
        dashboardInfo: {
            type: 'regular',
            name: 'Node yang Anda Ikuti',
            countNodes: outdoorSubscribedNodes.length
        },
        indoor: null,
        outdoor: outdoorData,
        nodes: outdoorNodeAnalized.map(({ dataLogs, ...n }) => ({ ...n })),
        currentEventLogs: [],
        nearReports: []
    }

    res.json({
        success: true,
        result: result,
    })
}




export const dashboardData: ControllerType = (req, res, next) => {
    if (req.user.role == 'manager') return dashboardDataForManagerUser(req, res, next)
    else return dashboardDataForRegularUser(req, res, next)
}



