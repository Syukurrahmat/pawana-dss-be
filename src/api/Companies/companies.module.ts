import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import Companies from '../../models/companies.js';
import { CompaniesController } from './companies.controller.js';
import { CompaniesService } from './companies.service.js';

@Module({
    imports: [SequelizeModule.forFeature([Companies])],
    controllers: [CompaniesController],
    providers: [CompaniesService],
    exports: [CompaniesService],
})

export class CompaniesModule { }
