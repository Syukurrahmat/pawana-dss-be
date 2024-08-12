import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Session, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SessionData } from 'express-session';
import { Roles } from '../../decorator/role.decorator.js';
import { PaginationQueryDto } from '../../lib/pagination.dto.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { FindUserDto } from './dto/find-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserGuard } from './user.guard.js';
import { UsersService } from './users.service.js';
import { FindCompaniesDto } from './dto/find-companies.dto.js';

@Controller('users')
@ApiTags('Users')
@UseGuards(UserGuard)
export class UsersController {
    constructor(private readonly service: UsersService) { }


    @Post('/')
    create(
        @Body() createUserDto: CreateUserDto) {
        return this.service.create(createUserDto);
    }

    @Get('/')
    async findAll(
        @Query() pagination: PaginationQueryDto,
        @Query() filter: FindUserDto,
    ) {
        return this.service.findAll(filter, pagination);
    }

    @Get('/overview')
    getOverview() {
        return this.service.getOverview()
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.service.findOne(id);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
        return this.service.update(id, updateUserDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.service.remove(+id);
    }

    @Get(':id/dashboard')
    dashboard(
        @Param('id', ParseIntPipe) id: number,
        @Session() session: SessionData
    ) {
        return this.service.getDashboardData(id, session.tz);
    }

    @Get(':id/companies')
    ownCompanies(
        @Param('id', ParseIntPipe) id: number,
        @Query() pagination: PaginationQueryDto,
        @Query() filter: FindCompaniesDto,
    ) {
        return this.service.ownCompanies(id, pagination, filter);
    }

    @Get(':id/private-nodes')
    ownPrivateNodes(
        @Param('id', ParseIntPipe) id: number,
        @Query() pagination: PaginationQueryDto,
    ) {
        return this.service.ownPrivateNodes(id, pagination);
    }
}
