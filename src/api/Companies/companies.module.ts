import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import Companies from '../../models/companies.js';
import DataLogs from '../../models/datalogs.js';
import Reports from '../../models/reports.js';
import { DashboardModule } from '../../services/Dashboard/dashboard.module.js';
import { SummaryModule } from '../../services/Summary/summary.module.js';
import { CompaniesController } from './companies.controller.js';
import { CompaniesService } from './companies.service.js';

@Module({
    imports: [DashboardModule, SummaryModule, SequelizeModule.forFeature([Companies, DataLogs, Reports])],
    controllers: [CompaniesController],
    providers: [CompaniesService],
    exports: [CompaniesService],
})

export class CompaniesModule { }
