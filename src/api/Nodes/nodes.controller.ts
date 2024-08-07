import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, ParseBoolPipe } from '@nestjs/common';
import { NodesService } from './nodes.service.js';
import { PaginationQueryDto } from '../../lib/pagination.dto.js';
import { ApiTags } from '@nestjs/swagger';
import { User } from '../../decorator/user.decorator.js';
import Users from '../../models/users.js';
import { CreateNodeDto } from './dto/create-nodes.dto.js';
import { FindNodesDto } from './dto/find-nodes.dto.js';
import { UpdateNodeDto } from './dto/update-nodes.dto.js';

@Controller('nodes')
@ApiTags('nodes')
export class NodesController {
    constructor(private readonly usersService: NodesService) { }

    @Post('/')
    create(@Body() createDto: CreateNodeDto) {
        return this.usersService.create(createDto);
    }

    @Get('/')
    async findAll(
        @Query() pagination: PaginationQueryDto,
        @Query() filter: FindNodesDto,
    ) {
        return this.usersService.findAll(filter, pagination);
    }

    @Get('/summary')
    getsummary() {
        return this.usersService.getSummary()
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

    @Get('/subscribeable')
    getSubscribeableNodes(
        @Query('search') search?: string,
        @Query('forCompanySubs', new ParseIntPipe({ optional: true })) forCompanySubs?: number,
        @Query('forUserSubs', new ParseIntPipe({ optional: true })) forUserSubs?: number,
    ) {
        return this.usersService.getSubscribeableNodes(forCompanySubs, forUserSubs, search)
    }
   
    @Get('/downloadable')
    getDownloadableNodes(
        @Query() pagination: PaginationQueryDto,
        @User() User: Users,
    ) {
        return this.usersService.getDownloadableNodes(User, pagination)
    }
  
    @Get('/:id/datalogs')
    getDataLogs(
        @Param('id', ParseIntPipe) id: number, 
        @Query('start') start : string,
        @Query('end') end : string,
    ) {
        return this.usersService.getDatalogs(id, start, end)
    }
}
