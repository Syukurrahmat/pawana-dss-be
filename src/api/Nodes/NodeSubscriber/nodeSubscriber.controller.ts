import { Controller, Delete, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../lib/pagination.dto.js';
import { NodeSubscriberService } from './nodeSubscriber.service.js';
import { NodesGuard } from '../nodes.guard.js';
import { ParseIntPipeOptional } from '../../../pipe/ParseIntPipeOptional.js';

// ============== api/nodes/:id/  ==============

@Controller('')
@ApiTags('Nodes subscriber')
@UseGuards(NodesGuard)
export class NodeSubscriberController {
    constructor(private readonly service: NodeSubscriberService) { }

    @Get('/companies')
    getSubsciberUsers(
        @Param('id', ParseIntPipe) nodeId: number,
        @Query() pagination: PaginationQueryDto,
    ) {
        return this.service.getSubsciberCompanies(nodeId, pagination)

    }

    @Delete('/companies/:companyId?')
    deleteSubsciberUsers(
        @Param('id', ParseIntPipe) nodeId: number,
        @Param('companyId', ParseIntPipeOptional) companyId?: number,
    ) {
        return this.service.deleteSubsciberCompanies(nodeId, companyId)
    }


    @Get('/users')
    getSubsciberCompanies(
        @Param('id', ParseIntPipe) nodeId: number,
        @Query() pagination: PaginationQueryDto,
    ) {
        return this.service.getSubsciberUsers(nodeId, pagination)

    }

    @Delete('/users/:userId?')
    deleteSubsciberCompanies(
        @Param('id', ParseIntPipe) nodeId: number,
        @Param('userId', ParseIntPipeOptional) userId?: number,
    ) {
        return this.service.deleteSubsciberUsers(nodeId, userId)
    }
}