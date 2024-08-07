import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import Nodes from '../../../models/nodes.js';
import Users from '../../../models/users.js';
import { UserNodeSubsController } from './userNodeSubs.controller.js';
import { UserNodeSubsService } from './userNodeSubs.service.js';

@Module({
    imports: [SequelizeModule.forFeature([Users, Nodes])],
    controllers: [UserNodeSubsController],
    providers: [UserNodeSubsService],
    exports: [UserNodeSubsService],
})

export class UserNodeSubsModule { }
