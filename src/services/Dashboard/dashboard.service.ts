import { Injectable } from '@nestjs/common';
import moment from 'moment';
import { Op, literal, where } from 'sequelize';
import Companies from '../../models/companies.js';
import { InjectModel } from '@nestjs/sequelize';
import Reports from '../../models/reports.js';
import EventLogs from '../../models/eventLogs.js';
import Users from '../../models/users.js';
import { DashboardDataType, NodeWLastestData } from '../../types/dashboardData.js';

import { analyzingNode as getLastestData, chooseAnalyzeData, identifyAnalyzeType } from '../Logic/index'

@Injectable()
export class DashboardService {
    private nodeAttributes = ['nodeId', 'name', 'coordinate', 'companyId', 'lastDataSent', 'isUptodate']
    private eventLogAttributes = ['eventLogId', 'companyId', 'name', 'type', 'isCompleted', 'startDate', 'endDate']

    constructor(
        @InjectModel(Reports) private reportsDB: typeof Reports,
    ) { }

    async forCompany(company: Companies, tz: string) {
        const companyInformation = company.toJSON()

        const currentEventLogs = await this.getCurrentEventLogs(company)
        const nearReports = await this.getNearReports(company)



        const indoorNodes = await company.getPrivateNodes({ attributes: this.nodeAttributes })
        const outdoorNodes = await company.getSubscribedNodes({ attributes: this.nodeAttributes, joinTableAttributes: [] })
        

        const indoorNodesWLastestData = await Promise.all<NodeWLastestData>(indoorNodes.map(e => getLastestData(e, tz)))
        const outdoorNodesWLastestData = await Promise.all<NodeWLastestData>(outdoorNodes.map(e => getLastestData(e, tz)))

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
            data: await chooseAnalyzeData(activeIndoorNodes, tz, indoorAnaliysisType),
        }

        const outdoorData = {
            countNodes: {
                active: activeOutdoorNodes.length,
                all: outdoorNodes.length,
            },
            analiysisDataType: outdoorAnaliysisType,
            data: await chooseAnalyzeData(activeOutdoorNodes, tz, outdoorAnaliysisType)
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

        return result
    }

    async forRegularUser(user: Users, tz: string) {

        const outdoorNodes = await user.getSubscribedNodes({ attributes: this.nodeAttributes, joinTableAttributes: [] })

        const analyzedOutdoorNodes = await Promise.all(outdoorNodes.map(e => getLastestData(e, tz)))
        const filteredAnalyzedOutdoorNodes = analyzedOutdoorNodes.filter(e => e.latestData) as NodeWLastestData[]
        const outdoorAnaliysisType = identifyAnalyzeType(filteredAnalyzedOutdoorNodes)

        const outdoorData = {
            countNodes: {
                active: filteredAnalyzedOutdoorNodes.length,
                all: outdoorNodes.length,
            },
            analiysisDataType: outdoorAnaliysisType,
            data: await chooseAnalyzeData(filteredAnalyzedOutdoorNodes, tz, outdoorAnaliysisType)
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

        return result
    }


    private async getCurrentEventLogs(company: Companies) {
        const now = new Date()
        return await company.getEventLogs({
            attributes: this.eventLogAttributes,
            where: {
                startDate: { [Op.lte]: now },
                isCompleted: false,
                [Op.or]: [
                    { endDate: { [Op.is]: null } },
                    { endDate: { [Op.gte]: now } }
                ]
            }
        })
    }

    private async getNearReports(company: Companies) {
        const now = new Date()

        return await this.reportsDB.findAll({
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
                model: Users,
                attributes: ['name', 'userId', 'profilePicture']
            }]
        })
    }
}