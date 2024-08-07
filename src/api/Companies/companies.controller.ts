import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Session } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SessionData } from 'express-session';
import { PaginationQueryDto } from '../../lib/pagination.dto.js';
import { CompaniesService } from './companies.service.js';
import { CreateCompaniesDto } from './dto/create-companies.dto.js';
import { FindCompaniesDto } from './dto/find-companies.dto.js';
import { SummaryDto } from './dto/get-summary.dto.js';
import { UpdateCompaniesDto } from './dto/update-companies.dto.js';

@Controller('companies')
@ApiTags('companies')
export class CompaniesController {
    constructor(private readonly usersService: CompaniesService) { }

    @Post('/')
    create(@Body() createDto: CreateCompaniesDto) {
        return this.usersService.create(createDto);
    }

    @Get('/')
    async findAll(
        @Query() pagination: PaginationQueryDto,
        @Query() filter: FindCompaniesDto,
    ) {
        return this.usersService.findAll(filter, pagination);
    }

    @Get('/overview')
    getOverview() {
        return this.usersService.getOverview()
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateCompaniesDto) {
        return this.usersService.update(id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.remove(id);
    }

    @Get(':id/private-nodes')
    ownCompanies(
        @Param('id', ParseIntPipe) id: number,
        @Query() pagination: PaginationQueryDto,
    ) {
        return this.usersService.getPrivateNodes(id, pagination)
    }


    @Get(':id/dashhboard')
    dashhboard(
        @Param('id', ParseIntPipe) id: number,
        @Session() session: SessionData
    ) {
        return this.usersService.getDashboardData(id, session.tz);
    }

    @Get(':id/summary/')
    getReport(
        @Query() summaryDto: SummaryDto,
        @Param('id', ParseIntPipe) id: number,
        @Session() session: SessionData
    ) {
        return this.usersService.getSummary(id, summaryDto, session.tz);
    }
}
