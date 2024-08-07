import { Module } from '@nestjs/common';
import { SummaryService } from './summary.service';
import { EventlogsService } from '../../api/Companies/Eventlogs/eventlog.service';
import { SequelizeModule } from '@nestjs/sequelize';
import DataLogs from '../../models/datalogs';
import Reports from '../../models/reports';
import EventLogs from '../../models/eventLogs';

@Module({
  imports: [SequelizeModule.forFeature([DataLogs, EventLogs, Reports])],
  providers: [SummaryService, EventlogsService],
  exports: [SummaryService]
})
export class SummaryModule { }
