import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import Companies from '../../../models/companies';
import EventLogs from '../../../models/eventLogs';
import Users from '../../../models/users';
import { EventlogController } from './eventlog.controller.js';
import { EventlogsService } from './eventlog.service.js';
import Nodes from '../../../models/nodes';

@Module({
    imports: [SequelizeModule.forFeature([Users, Companies,Nodes, EventLogs])],
    controllers: [EventlogController],
    providers: [EventlogsService],
    exports: [EventlogsService],
})

export class EventlogsModule { }
