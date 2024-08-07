import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import Companies from '../../models/companies';
import Users from '../../models/users';
import { ApplicationController } from './app.controller';
import { ApplicationService } from './app.service';

@Module({
  imports: [SequelizeModule.forFeature([Companies, Users])],
  controllers: [ApplicationController],
  providers: [ApplicationService],
})

export class ApplicationModule { }
