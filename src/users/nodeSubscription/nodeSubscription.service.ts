import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PaginationQueryDto } from '@/dto/pagination.dto.js';
import { Op, Sequelize } from 'sequelize';
import { SUBS_LIMIT } from '../../constants/server.js';
import Users from '../../models/users.js';
import Nodes from '../../models/nodes.js';
import { InjectModel } from '@nestjs/sequelize';
import { CreateSubscriptionDto } from './dto/create-subs.dto.js';

@Injectable()
export class NodeSubscriptionService {
    constructor(
        @InjectModel(Users)
        private userDB: typeof Users,
        @InjectModel(Nodes)
        private nodeDB: typeof Nodes,
    ) { }

    async createNodeSubscription(userId: number, createDto: CreateSubscriptionDto) {
        const user = await this.getUser(userId)
        const nodeIds = createDto.nodeIds!

        const countSubscribed = await user.countSubscribedNodes()

        if (countSubscribed >= SUBS_LIMIT || nodeIds.length + countSubscribed > SUBS_LIMIT) {
            throw new ForbiddenException('Melebih batas yang diizinkan')
        }

        const nodes = await this.nodeDB.findAll({
            where: { nodeId: { [Op.in]: nodeIds.filter((e) => e) } },
            attributes: ['nodeId'],
        });

        if (nodes.length == 0) throw new NotFoundException('node tidak ditemukan')
        await user.addSubscribedNodes(nodes)

        return 'success'
    };


    async getSubscribedNodes(userId: number, pagination: PaginationQueryDto) {
        const { paginationObj, searchObj, getMetaData } = pagination
        const user = await this.getUser(userId)

        const where = { ...searchObj }

        const [count, rows] = await Promise.all([
            user.countSubscribedNodes({ where }),
            user.getSubscribedNodes({
                attributes: [
                    'nodeId', 'name', 'coordinate', 'lastDataSent', 'isUptodate',
                    [Sequelize.col('UsersSubscriptions.createdAt'), 'joinedAt'],
                    [Sequelize.col('UsersSubscriptions.usersSubscriptionId'), 'subscriptionId']
                ],
                joinTableAttributes: [],
                where,
                ...paginationObj,
                order: [[Sequelize.col('joinedAt'), 'DESC']],
            })
        ])

        return {
            rows,
            meta: getMetaData(pagination, count)
        };
    };


    async removeNodeSubscription(userId: number, subscriptionId: number) {
        const user = await this.getUser(userId)
        await user.removeSubscribedNode(subscriptionId)
        return 'success'
    };


    private async getUser(id: number) {
        const user = await this.userDB.findOne({
            where: { userId: id, isVerified: true },
            attributes: { exclude: ['createdAt', 'updatedAt', 'password'] },
        })

        if (!user) throw new NotFoundException()
        return user
    }

}
