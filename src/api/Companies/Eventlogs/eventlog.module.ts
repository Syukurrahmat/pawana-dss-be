import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import EventLogs from '../../../models/eventLogs';
import { EventlogController } from './eventlog.controller.js';
import { EventlogsService } from './eventlog.service.js';

@Module({
    imports: [SequelizeModule.forFeature([EventLogs])],
    controllers: [EventlogController],
    providers: [EventlogsService],
    exports: [EventlogsService],
})

export class EventlogsModule { }
