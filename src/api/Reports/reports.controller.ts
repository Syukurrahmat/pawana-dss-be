import { Controller, Get, Post, Query, Session } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from '../../decorator/user.decorator';
import { CreateReportDto } from './dto/create-report.dto';
import { FindReportDto } from './dto/find-report.dto';
import { ReportsService } from './reports.service';
import Users from '../../models/users';
import { SessionData } from 'express-session';

@Controller('reports')
@ApiTags('Reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Post()
    create(
        @User() userId : number,
        @Query() createReportDto: CreateReportDto) {
        return this.reportsService.create(userId, createReportDto);
    }

    @Get()
    findAll(
        @User() user : Users,
        @Session() session : SessionData,
        @Query() findReportDto : FindReportDto
    ) {
        return this.reportsService.findAll(user, findReportDto, session.tz);
    }

}
