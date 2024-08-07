import { Module } from '@nestjs/common';
import { EmailService } from '../../services/Email/email.service';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { SequelizeModule } from '@nestjs/sequelize';
import Users from '../../models/users';
import Nodes from '../../models/nodes';
import { DashboardModule } from '../../services/Dashboard/dashboard.module';

@Module({
    imports: [DashboardModule, SequelizeModule.forFeature([Users, Nodes])],
    controllers: [UsersController],
    providers: [UsersService, EmailService],
    exports: [UsersService],
})

export class UsersModule { }
