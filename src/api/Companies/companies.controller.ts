import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    Session,
    UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SessionData } from 'express-session';
import { PaginationQueryDto } from '../../lib/pagination.dto.js';
import { CompaniesService } from './companies.service.js';
import { CreateCompaniesDto } from './dto/create-companies.dto.js';
import { FindCompaniesDto } from './dto/find-companies.dto.js';
import { SummaryDto } from './dto/get-summary.dto.js';
import { UpdateCompaniesDto } from './dto/update-companies.dto.js';
import { User } from '../../common/decorator/user.decorator.js';
import Users from '../../models/users.js';
import { CompanyGuard } from './companies.guard.js';

@Controller('companies')
@ApiTags('Companies')
@UseGuards(CompanyGuard)
export class CompaniesController {
    constructor(private readonly service: CompaniesService) {}

    @Post('/')
    create(@User() user: Users, @Body() createDto: CreateCompaniesDto) {
        return this.service.create(createDto, user);
    }

    @Get('/')
    async findAll(@Query() pagination: PaginationQueryDto, @Query() filter: FindCompaniesDto) {
        return this.service.findAll(filter, pagination);
    }

    @Get('/overview')
    getOverview() {
        return this.service.getOverview();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.service.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateCompaniesDto) {
        return this.service.update(id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.service.remove(id);
    }

    @Get(':id/private-nodes')
    ownCompanies(
        @Param('id', ParseIntPipe) id: number,
        @Query() pagination: PaginationQueryDto,
        @Query() filter: FindCompaniesDto
    ) {
        return this.service.getPrivateNodes(id, filter, pagination);
    }

    @Get(':id/dashboard')
    dashboard(@Param('id', ParseIntPipe) id: number, @Session() session: SessionData) {
        return this.service.getDashboardData(id, session.tz);
    }

    @Get(':id/summary/')
    getReport(
        @Query() summaryDto: SummaryDto,
        @Param('id', ParseIntPipe) id: number,
        @Session() session: SessionData
    ) {
        return this.service.getSummary(id, summaryDto, session.tz);
    }
}
