import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import Nodes from '../../../models/nodes.js';
import { NodeSubscriberController } from './nodeSubscriber.controller.js';
import { NodeSubscriberService } from './nodeSubscriber.service.js';
import UsersSubscriptions from '../../../models/usersSubscriptions.js';
import CompanySubscriptions from '../../../models/companySubscriptions.js';

@Module({
    imports: [SequelizeModule.forFeature([Nodes, UsersSubscriptions, CompanySubscriptions])],
    controllers: [NodeSubscriberController],
    providers: [NodeSubscriberService],
    exports: [NodeSubscriberService],
})
export class NodeSubscriberModule {}
