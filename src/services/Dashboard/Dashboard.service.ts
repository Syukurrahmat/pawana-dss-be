import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import moment from 'moment';
import { Op, literal, where } from 'sequelize';
import Companies from '../../models/companies.js';
import Reports from '../../models/reports.js';
import Users from '../../models/users.js';
import { DashboardData, NodeWithLatestData } from '../../types/dashboardData.js';
import { DashboardLogic } from './dashboard-logic.js';
import { CategorizeValueService } from '../Logic/categorizingValue.service.js';

@Injectable()
export class DashboardService extends DashboardLogic {
    private nodeAttributes = ['nodeId', 'name', 'coordinate', 'companyId', 'lastDataSent', 'isUptodate']
    private eventLogAttributes = ['eventLogId', 'companyId', 'name', 'type', 'isCompleted', 'startDate', 'endDate']

    constructor(
        @InjectModel(Reports) private reportsDB: typeof Reports,
        categorizingService: CategorizeValueService,
    ) {
        super(categorizingService)
    }

    async forCompany(company: Companies, tz: string) {
        const companyInformation = company.toJSON()

        const currentEventLogs = await this.getCurrentEventLogs(company)
        const nearReports = await this.getNearReports(company)

        const indoorNodes = await company.getPrivateNodes({ attributes: this.nodeAttributes })
        const outdoorNodes = await company.getSubscribedNodes({ attributes: this.nodeAttributes, joinTableAttributes: [] })


        const indoorNodesWLastestData = await Promise.all<NodeWithLatestData>(
            indoorNodes.map(e => this.getLatestData(e, tz))
        )
        const outdoorNodesWLastestData = await Promise.all<NodeWithLatestData>(
            outdoorNodes.map(e => this.getLatestData(e, tz))
        )

        const activeIndoorNodes = indoorNodesWLastestData.filter(e => e.latestData)
        const activeOutdoorNodes = outdoorNodesWLastestData.filter(e => e.latestData)

        const indoorAnaliysisType = this.identifyAnalyzeType(activeIndoorNodes)
        const outdoorAnaliysisType = this.identifyAnalyzeType(activeOutdoorNodes)

        const indoorData = {
            countNodes: {
                active: activeIndoorNodes.length,
                all: indoorNodes.length,
            },
            analiysisDataType: indoorAnaliysisType,
            data: await this.analyzeData(activeIndoorNodes, tz, indoorAnaliysisType),
        }

        const outdoorData = {
            countNodes: {
                active: activeOutdoorNodes.length,
                all: outdoorNodes.length,
            },
            analiysisDataType: outdoorAnaliysisType,
            data: await this.analyzeData(activeOutdoorNodes, tz, outdoorAnaliysisType)
        }

        const result: DashboardData = {
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

        const analyzedOutdoorNodes = await Promise.all(
            outdoorNodes.map(e => this.getLatestData(e, tz)
            ))

        const filteredAnalyzedOutdoorNodes = analyzedOutdoorNodes.filter(e => e.latestData) as NodeWithLatestData[]
        const outdoorAnaliysisType = this.identifyAnalyzeType(filteredAnalyzedOutdoorNodes)

        const outdoorData = {
            countNodes: {
                active: filteredAnalyzedOutdoorNodes.length,
                all: outdoorNodes.length,
            },
            analiysisDataType: outdoorAnaliysisType,
            data: await this.analyzeData(filteredAnalyzedOutdoorNodes, tz, outdoorAnaliysisType)
        }

        const result: DashboardData = {
            dashboardInfo: {
                type: 'regular',
                name: '',
                userId : user.userId,
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