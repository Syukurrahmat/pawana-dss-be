import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Session, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateEventDto } from './dto/create-eventlog.dto.js';
import { EventlogsService } from './eventlog.service.js';
import { SessionData } from 'express-session';
import { UpdateEventDto } from './dto/update-eventlog.dto.js';
import { CompanyGuard } from '../companies.guard.js';

// ==================== api/companies/:id/events/ ================== 

@Controller('')
@ApiTags('Eventlogs')
@UseGuards(CompanyGuard)
export class EventlogController {
    constructor(private readonly usersService: EventlogsService) { }

    @Post('/')
    create(
        @Param('id', ParseIntPipe) companyId: number,
        @Body() createDto: CreateEventDto
    ) {
        return this.usersService.create(companyId, createDto);
    }

    @Get('/')
    findAll(
        @Param('id', ParseIntPipe) companyId: number,
        @Session() session: SessionData,
        @Query('month') month?: string,
    ) {
        return this.usersService.findAll(companyId, month, session.tz);
    }

    @Get('/overview')
    getCurrentEventOverview(
        @Param('id', ParseIntPipe) companyId: number,
        @Session() session: SessionData,
    ) {
        return this.usersService.getCurrentEventSummary(companyId, session.tz);
    }

    @Get('/:id')
    findById(
        @Param('id', ParseIntPipe) companyId: number,
        @Param('id', ParseIntPipe) eventId: number,
        @Session() session: SessionData
    ) {
        return this.usersService.findOne(companyId, eventId, session.tz);
    }

    @Patch('/:id/start-now')
    setStartNow(
        @Param('id', ParseIntPipe) companyId: number,
        @Param('id', ParseIntPipe) eventId: number,
    ) {
        return this.usersService.setEventIsStartNow(companyId, eventId);
    }

    @Patch('/:id')
    update(
        @Param('companyId', ParseIntPipe) companyId: number,
        @Param('id', ParseIntPipe) eventId: number,
        @Body() updateDto: UpdateEventDto
    ) {
        return this.usersService.update(companyId, eventId, updateDto);
    }

    @Patch('/:id/completed')
    setCompleted(
        @Param('companyId', ParseIntPipe) companyId: number,
        @Param('id', ParseIntPipe) eventId: number,
        @Session() session: SessionData
    ) {
        return this.usersService.setEventIsCompleted(companyId, eventId, session.tz);
    }

    @Delete('/:id')
    delete(
        @Param('companyId', ParseIntPipe) companyId: number,
        @Param('id', ParseIntPipe) eventId: number,
    ) {
        return this.usersService.delete(companyId, eventId);
    }


}
