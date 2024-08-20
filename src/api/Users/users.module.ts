import { RouterModule } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { EmailService } from '../../services/Email/Email.service';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { SequelizeModule } from '@nestjs/sequelize';
import Users from '../../models/users';
import Nodes from '../../models/nodes';
import { UserNodeSubsModule } from './UserNodeSubs/userNodeSubs.module';
import { DashboardService } from '../../services/Dashboard/Dashboard.service';
import Reports from '../../models/reports';
import { CategorizeValueService } from '../../services/Logic/categorizingValue.service';

@Module({
    imports: [
        SequelizeModule.forFeature([Users, Nodes, Reports]),
        UserNodeSubsModule,
        RouterModule.register([
            {
                path: 'api/users/:id/nodes',
                module: UserNodeSubsModule,
            },
        ]),
    ],
    controllers: [UsersController],
    providers: [UsersService, EmailService, DashboardService, CategorizeValueService],
    exports: [UsersService],
})
export class UsersModule {}
