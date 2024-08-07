import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import Nodes from '../../models/nodes.js';
import { NodesController } from './nodes.controller.js';
import { NodesService } from './nodes.service.js';
import CompanySubscriptions from '../../models/companySubscriptions.js';
import UsersSubscriptions from '../../models/usersSubscriptions.js';
import Companies from '../../models/companies.js';
import { NodeSubscriberModule } from './NodeSubscriber/nodeSubscriber.module.js';
import { RouterModule } from '@nestjs/core';
import { NodeUtilsModule } from './NodeUtils/nodeUtils.module.js';

@Module({
    imports: [
        NodeSubscriberModule,
        NodeUtilsModule,
        SequelizeModule.forFeature([Nodes, Companies, CompanySubscriptions, UsersSubscriptions, CompanySubscriptions]),
        RouterModule.register([
            {
                path: 'api/nodes/:id/',
                module: NodeSubscriberModule
            },
            {
                path: 'api/nodes/',
                module: NodeUtilsModule
            },
        ])
    ],
    controllers: [NodesController],
    providers: [NodesService],
    exports: [NodesService],
})

export class NodesModule { }
