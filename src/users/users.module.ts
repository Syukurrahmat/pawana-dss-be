import { Module } from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { SequelizeModule } from '@nestjs/sequelize';
import Users from '@/models/users';
import Nodes from '@/models/nodes';
import Companies from '@/models/companies';

@Module({
    imports: [SequelizeModule.forFeature([Users, Nodes, Companies])],
    controllers: [UsersController],
    providers: [UsersService, EmailService],
    exports: [UsersService],
})

export class UsersModule { }
