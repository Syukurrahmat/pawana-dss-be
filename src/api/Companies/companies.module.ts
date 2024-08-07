import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import Companies from '../../models/companies.js';
import DataLogs from '../../models/datalogs.js';
import Reports from '../../models/reports.js';
import { DashboardModule } from '../../services/Dashboard/dashboard.module.js';
import { SummaryModule } from '../../services/Summary/summary.module.js';
import { CompaniesController } from './companies.controller.js';
import { CompaniesService } from './companies.service.js';
import { CompanyNodeSubsModule } from './CompanyNodeSubs/companyNodeSubs.module.js';
import { RouterModule } from '@nestjs/core';
import { EventlogsModule } from './Eventlogs/eventlog.module.js';

@Module({
    imports: [
        DashboardModule,
        SummaryModule,
        CompanyNodeSubsModule,
        EventlogsModule,
        SequelizeModule.forFeature([Companies, DataLogs, Reports]),
        RouterModule.register([
            {
                path: 'api/companies/:id/nodes',
                module: CompanyNodeSubsModule
            },
            {
                path: 'api/companies/:id/events',
                module: EventlogsModule
            }
        ])
    ],
    controllers: [CompaniesController],
    providers: [CompaniesService],
    exports: [CompaniesService],
})

export class CompaniesModule { }
