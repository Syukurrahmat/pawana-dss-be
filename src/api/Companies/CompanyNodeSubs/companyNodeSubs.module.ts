import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import Companies from '../../../models/companies.js';
import Nodes from '../../../models/nodes.js';
import { CompanyNodeSubsController } from './companyNodeSubs.controller.js';
import { CompanyNodeSubsService } from './companyNodeSubs.service.js';

@Module({
    imports: [SequelizeModule.forFeature([Companies, Nodes])],
    controllers: [CompanyNodeSubsController],
    providers: [CompanyNodeSubsService],
    exports: [CompanyNodeSubsService],
})
export class CompanyNodeSubsModule {}
