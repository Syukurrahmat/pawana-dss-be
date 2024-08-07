import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, ProjectionAlias, Sequelize } from 'sequelize';
import { PaginationQueryDto } from '../../../lib/pagination.dto.js';
import CompanySubscriptions from '../../../models/companySubscriptions.js';
import Nodes from '../../../models/nodes.js';
import UsersSubscriptions from '../../../models/usersSubscriptions.js';
import Users from '../../../models/users.js';

@Injectable()
export class NodeUtilsService {
    constructor(
        @InjectModel(Nodes)
        private NodesDB: typeof Nodes,
    ) { }

    async getSubscribeableNodes(companyId: number | undefined, userId: number | undefined, search: string | undefined) {

        let isSubscribedQuery: ProjectionAlias[] = [];

        if (companyId) isSubscribedQuery = [[
            Sequelize.literal(`(
                SELECT COUNT(*) FROM companysubscriptions
                WHERE companysubscriptions.nodeId = Nodes.nodeId
                AND companysubscriptions.companyId = ${companyId || 'null'}
            )`),
            'isSubscribed',
        ]];

        if (userId) isSubscribedQuery = [[
            Sequelize.literal(`(
                SELECT COUNT(*) FROM userssubscriptions
                WHERE userssubscriptions.nodeId = Nodes.nodeId
                AND userssubscriptions.userId = ${userId || 'null'}
            )`),
            'isSubscribed',
        ]];

        const searchObj = search ? { name: { [Op.like]: search } } : {}

        const nodes = await this.NodesDB.findAll({
            attributes: [
                'nodeId',
                'name',
                'coordinate',
                'isUptodate',
                'lastDataSent',
                'createdAt',
                'companyId',
                ...isSubscribedQuery
            ],
            where: {
                ...searchObj,
                companyId: { [Op.is]: undefined }
            }
        })

        return nodes
    };

    async getDownloadableNodes(user: Users, pagination: PaginationQueryDto) {
        const { paginationObj, searchObj, getMetaData } = pagination
        const { role } = user

        const whereOpt = { ...searchObj }

        if (role == 'manager') {
            const companyIds = (await user.getCompanies({ attributes: ['companyId'] })).map(e => e.companyId!);

            whereOpt[Op.or] = [
                { companyId: { [Op.in]: companyIds } },
                { '$companySubscriptions.companyId$': { [Op.in]: companyIds } },
            ]
        }

        const { count, rows } = await this.NodesDB.findAndCountAll({
            attributes: ['nodeId', 'name'],
            where: whereOpt,
            ...paginationObj
        });


        return {
            rows,
            meta: getMetaData(pagination, count)
        };
    }
}
