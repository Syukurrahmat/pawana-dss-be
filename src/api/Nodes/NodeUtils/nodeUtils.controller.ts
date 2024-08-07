import { Controller, Delete, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../lib/pagination.dto.js';
import { NodeUtilsService } from './nodeUtils.service.js';
import { NodesGuard } from '../nodes.guard.js';
import { User } from '../../../decorator/user.decorator.js';
import Users from '../../../models/users.js';

// ============== api/nodes/:id/  ==============

@Controller('')
@ApiTags('Nodes Utils')
export class NodeUtilsController {
    constructor(private readonly usersService: NodeUtilsService) { }

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

}