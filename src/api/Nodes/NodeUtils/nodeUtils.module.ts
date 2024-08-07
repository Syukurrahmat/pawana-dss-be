import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import Nodes from '../../../models/nodes.js';
import { NodeUtilsService } from './nodeUtils.service.js';
import UsersSubscriptions from '../../../models/usersSubscriptions.js';
import CompanySubscriptions from '../../../models/companySubscriptions.js';
import { NodeUtilsController } from './nodeUtils.controller.js';

@Module({
    imports: [SequelizeModule.forFeature([Nodes, UsersSubscriptions, CompanySubscriptions])],
    controllers: [NodeUtilsController],
    providers: [NodeUtilsService],
    exports: [NodeUtilsService],
})

export class NodeUtilsModule { }
