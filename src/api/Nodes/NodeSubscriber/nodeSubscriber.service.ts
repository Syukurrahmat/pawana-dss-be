import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize';
import { PaginationQueryDto } from '../../../lib/pagination.dto.js';
import CompanySubscriptions from '../../../models/companySubscriptions.js';
import Nodes from '../../../models/nodes.js';
import UsersSubscriptions from '../../../models/usersSubscriptions.js';

@Injectable()
export class NodeSubscriberService {
    constructor(
        @InjectModel(Nodes)
        private nodeDB: typeof Nodes,

        @InjectModel(UsersSubscriptions)
        private userSubscriptionDB: typeof UsersSubscriptions,

        @InjectModel(CompanySubscriptions)
        private companySubscriptionsDB: typeof CompanySubscriptions,
    ) { }

    async getSubsciberUsers(nodeId: number, pagination: PaginationQueryDto) {
        const { paginationObj, searchObj, getMetaData } = pagination
        const node = await this.getNode(nodeId)

        const [count, rows] = await Promise.all([
            node.countUserSubscriptions({ where: { ...searchObj } }),
            node.getUserSubscriptions({
                where: { ...searchObj },
                attributes: [
                    'userId', 'name', 'phone', 'role', 'profilePicture',
                    [Sequelize.col('UsersSubscriptions.createdAt'), 'joinedAt'],
                    [Sequelize.col('UsersSubscriptions.usersSubscriptionId'), 'subscriptionId']
                ],
                joinTableAttributes: [],
                ...paginationObj,
                order: [[Sequelize.col('joinedAt'), 'DESC']],
            })

        ])

        return {
            rows,
            meta: getMetaData(pagination, count)
        };
    };

    async getSubsciberCompanies(nodeId: number, pagination: PaginationQueryDto) {
        const { paginationObj, searchObj, getMetaData } = pagination
        const node = await this.getNode(nodeId)

        const [count, rows] = await Promise.all([
            node.countCompanySubscriptions({ where: { ...searchObj } }),
            node.getCompanySubscriptions({
                where: { ...searchObj },
                attributes: [
                    'companyId', 'name', 'type',
                    [Sequelize.col('CompanySubscriptions.createdAt'), 'joinedAt'],
                    [Sequelize.col('CompanySubscriptions.companySubscriptionId'), 'subscriptionId']
                ],
                joinTableAttributes: [],
                ...paginationObj,
                order: [[Sequelize.col('joinedAt'), 'DESC']],
            })
        ])

        return {
            rows,
            meta: getMetaData(pagination, count)
        };
    }


    async deleteSubsciberUsers(nodeId: number, userId: number | undefined) {
        const node = await this.getNode(nodeId)
        userId
            ? await node.removeUserSubscription(userId)
            : await node.setUserSubscriptions([])
        return 'success'
    }

    async deleteSubsciberCompanies(nodeId: number, companyId: number | undefined) {
        const node = await this.getNode(nodeId)
        companyId
            ? await node.removeCompanySubscription(companyId)
            : await node.setCompanySubscriptions([])

        return 'success'
    }



    private async getNode(id: number) {
        const node = await this.nodeDB.findOne({ where: { nodeId: id } })
        if (!node) throw new NotFoundException()
        return node
    }
}
