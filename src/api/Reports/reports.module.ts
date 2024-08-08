import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import Reports from '../../models/reports';
import { ImgbbService } from '../../services/Imgbb.service';

@Module({
  imports: [SequelizeModule.forFeature([Reports])],
  controllers: [ReportsController],
  providers: [ReportsService, ImgbbService],
})
export class ReportsModule { }
