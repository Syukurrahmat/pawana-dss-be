import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, ParseBoolPipe, UseGuards } from '@nestjs/common';
import { NodesService, NodeUtilsService } from './nodes.service.js';
import { PaginationQueryDto } from '../../lib/pagination.dto.js';
import { ApiTags } from '@nestjs/swagger';
import { User } from '../../decorator/user.decorator.js';
import Users from '../../models/users.js';
import { CreateNodeDto } from './dto/create-nodes.dto.js';
import { FindDatalogsDto, FindNodesDto } from './dto/find-nodes.dto.js';
import { UpdateNodeDto } from './dto/update-nodes.dto.js';
import { NodesGuard } from './nodes.guard.js';
import { ParseIntPipeOptional } from '../../pipe/ParseIntPipeOptional.js';

@Controller('nodes')
@ApiTags('Nodes')
@UseGuards(NodesGuard)
export class NodesController {
    constructor(private readonly service: NodesService) { }

    @Post('/')
    create(
        @Body() createDto: CreateNodeDto,
        @User() user: Users
    ) {
        return this.service.create(createDto, user);
    }

    @Get('/')
    async findAll(
        @Query() pagination: PaginationQueryDto,
        @Query() filter: FindNodesDto,
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
    update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateNodeDto) {
        return this.service.update(id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.service.remove(id);
    }


    @Get('/:id/datalogs')
    getDataLogs(
        @Param('id', ParseIntPipe) id: number,
        @Query() startEndDate: FindDatalogsDto,
    ) {
        return this.service.getDatalogs(id, startEndDate)
    }
}


@Controller('nodes')
@ApiTags('Nodes Utils')
export class NodeUtilsController {
    constructor(private readonly service: NodeUtilsService) { }

    @Get('/subscribeable')
    getSubscribeableNodes(
        @Query('search') search?: string,
        @Query('forCompanySubs', ParseIntPipeOptional) forCompanySubs?: number,
        @Query('forUserSubs', ParseIntPipeOptional) forUserSubs?: number,
    ) {
        return this.service.getSubscribeableNodes(forCompanySubs, forUserSubs, search)
    }
 
}