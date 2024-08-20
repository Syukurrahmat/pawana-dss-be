import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import Reports from '../../models/reports';
import { ImgbbService } from '../../services/Imgbb.service';
import Companies from '../../models/companies';

@Module({
    imports: [SequelizeModule.forFeature([Reports, Companies])],
    controllers: [ReportsController],
    providers: [ReportsService, ImgbbService],
})
export class ReportsModule {}
