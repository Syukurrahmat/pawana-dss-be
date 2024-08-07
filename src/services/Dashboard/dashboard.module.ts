import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import Reports from '../../models/reports';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [SequelizeModule.forFeature([Reports])],
  providers: [DashboardService],
  exports: [DashboardService]
})
export class DashboardModule { }
