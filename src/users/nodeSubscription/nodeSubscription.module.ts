import { Module } from '@nestjs/common';

import { NodeSubscriptionService } from './nodeSubscription.service.js';
import { SequelizeModule } from '@nestjs/sequelize';
import Users from '@/models/users.js';
import Nodes from '@/models/nodes.js';
import { NodeSubscriptionController } from './nodeSubscription.controller.js';

@Module({
    imports: [SequelizeModule.forFeature([Users, Nodes])],
    controllers: [NodeSubscriptionController],
    providers: [NodeSubscriptionService],
    exports: [NodeSubscriptionService],
})

export class NodeSubscriptionModule { }
