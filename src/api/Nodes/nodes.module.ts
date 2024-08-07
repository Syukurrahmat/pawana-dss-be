import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import Nodes from '../../models/nodes.js';
import { NodesController } from './nodes.controller.js';
import { NodesService } from './nodes.service.js';
import CompanySubscriptions from '../../models/companySubscriptions.js';
import UsersSubscriptions from '../../models/usersSubscriptions.js';
import Companies from '../../models/companies.js';

@Module({
    imports: [SequelizeModule.forFeature([Nodes, Companies, CompanySubscriptions, UsersSubscriptions, CompanySubscriptions])],
    controllers: [NodesController],
    providers: [NodesService],
    exports: [NodesService],
})

export class NodesModule { }
