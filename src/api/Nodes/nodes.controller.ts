import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, ParseBoolPipe, UseGuards } from '@nestjs/common';
import { NodesService } from './nodes.service.js';
import { PaginationQueryDto } from '../../lib/pagination.dto.js';
import { ApiTags } from '@nestjs/swagger';
import { User } from '../../decorator/user.decorator.js';
import Users from '../../models/users.js';
import { CreateNodeDto } from './dto/create-nodes.dto.js';
import { FindNodesDto } from './dto/find-nodes.dto.js';
import { UpdateNodeDto } from './dto/update-nodes.dto.js';
import { NodesGuard } from './nodes.guard.js';

@Controller('nodes')
@ApiTags('Nodes')
@UseGuards(NodesGuard)
export class NodesController {
    constructor(private readonly usersService: NodesService) { }

    @Post('/')
    create(
        @Body() createDto: CreateNodeDto,
        @User() user: Users
    ) {
        return this.usersService.create(createDto, user);
    }

    @Get('/')
    async findAll(
        @Query() pagination: PaginationQueryDto,
        @Query() filter: FindNodesDto,
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
    update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateNodeDto) {
        return this.usersService.update(id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.remove(id);
    }


    @Get('/:id/datalogs')
    getDataLogs(
        @Param('id', ParseIntPipe) id: number,
        @Query('start') start: string,
        @Query('end') end: string,
    ) {
        return this.usersService.getDatalogs(id, start, end)
    }
}
