import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import EventLogs from '../../../models/eventLogs';
import { EventlogController } from './eventlog.controller.js';
import { EventlogsService } from './eventlog.service.js';
import Companies from '../../../models/companies';

@Module({
    imports: [SequelizeModule.forFeature([EventLogs, Companies])],
    controllers: [EventlogController],
    providers: [EventlogsService],
    exports: [EventlogsService],
})

export class EventlogsModule { }
