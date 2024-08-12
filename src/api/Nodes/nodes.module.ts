import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { SequelizeModule } from '@nestjs/sequelize';
import Companies from '../../models/companies.js';
import CompanySubscriptions from '../../models/companySubscriptions.js';
import Nodes from '../../models/nodes.js';
import UsersSubscriptions from '../../models/usersSubscriptions.js';
import { NodesController, NodeUtilsController } from './nodes.controller.js';
import { NodesService, NodeUtilsService } from './nodes.service.js';
import { NodeSubscriberModule } from './NodeSubscriber/nodeSubscriber.module.js';

@Module({
    imports: [
        NodeSubscriberModule,
        SequelizeModule.forFeature([Nodes, Companies, CompanySubscriptions, UsersSubscriptions, CompanySubscriptions]),
        RouterModule.register([
            {
                path: 'api/nodes/:id/',
                module: NodeSubscriberModule
            }
        ])
    ],
    controllers: [NodeUtilsController, NodesController],
    providers: [NodeUtilsService, NodesService],
    exports: [NodesService],
})

export class NodesModule { }
