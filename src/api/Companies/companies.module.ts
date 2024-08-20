import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { SequelizeModule } from '@nestjs/sequelize';
import Companies from '../../models/companies.js';
import DataLogs from '../../models/datalogs.js';
import Reports from '../../models/reports.js';
import { DashboardService } from '../../services/Dashboard/Dashboard.service.js';
import { SummaryService } from '../../services/Summary/Summary.service.js';
import { CompaniesController } from './companies.controller.js';
import { CompaniesService } from './companies.service.js';
import { CompanyNodeSubsModule } from './CompanyNodeSubs/companyNodeSubs.module.js';
import { EventlogsModule } from './Eventlogs/eventlog.module.js';
import { CategorizeValueService } from '../../services/Logic/categorizingValue.service.js';

@Module({
    imports: [
        CompanyNodeSubsModule,
        EventlogsModule,
        SequelizeModule.forFeature([Companies, DataLogs, Reports]),
        RouterModule.register([
            {
                path: 'api/companies/:id/nodes',
                module: CompanyNodeSubsModule,
            },
            {
                path: 'api/companies/:id/events',
                module: EventlogsModule,
            },
        ]),
    ],
    controllers: [CompaniesController],
    providers: [CompaniesService, SummaryService, DashboardService, CategorizeValueService],
    exports: [CompaniesService],
})
export class CompaniesModule {}
