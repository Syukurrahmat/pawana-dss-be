import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Session } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SessionData } from 'express-session';
import { User } from '../../decorator/user.decorator.js';
import { PaginationQueryDto } from '../../lib/pagination.dto.js';
import Users from '../../models/users.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { FindUserDto } from './dto/find-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UsersService } from './users.service.js';

@Controller('users')
@ApiTags('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post('/')
    create(
        @Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Get('/')
    async findAll(
        @User() users: Users,
        @Query() pagination: PaginationQueryDto,
        @Query() filter: FindUserDto,
    ) {
        return this.usersService.findAll(filter, pagination);
    }

    @Get('/overview')
    getOverview () {
        return this.usersService.getOverview()
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(+id);
    }

    @Get(':id/dashhboard')
    dashhboard(
        @Param('id', ParseIntPipe) id: number,
        @Session() session: SessionData
    ) {
        return this.usersService.getDashboardData(id, session.tz);
    }

    @Get(':id/companies')
    ownCompanies(
        @Param('id', ParseIntPipe) id: number,
        @Query() pagination: PaginationQueryDto,
    ) {
        return this.usersService.ownCompanies(id, pagination);
    }

    @Get(':id/private-node')
    ownPrivateNodes(
        @Param('id', ParseIntPipe) id: number,
        @Query() pagination: PaginationQueryDto,
    ) {
        return this.usersService.ownPrivateNodes(id, pagination);
    }
}
