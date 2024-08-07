import { Controller, Delete, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../lib/pagination.dto.js';
import { NodeSubscriberService } from './nodeSubscriber.service.js';
import { NodesGuard } from '../nodes.guard.js';

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
        return this.service.getSubsciberUsers(nodeId, pagination)
    }

    @Delete('/companies/:subscriptionId?')
    deleteSubsciberUsers(
        @Param('id', ParseIntPipe) nodeId: number,
        @Param('subscriptionId', new ParseIntPipe({ optional: true })) subscriptionId?: number,
    ) {
        return this.service.deleteSubsciberUsers(nodeId, subscriptionId)
    }


    @Get('/users')
    getSubsciberCompanies(
        @Param('id', ParseIntPipe) nodeId: number,
        @Query() pagination: PaginationQueryDto,
    ) {
        return this.service.getSubsciberCompanies(nodeId, pagination)
    }

    @Delete('/users/:subscriptionId?')
    deleteSubsciberCompanies(
        @Param('id', ParseIntPipe) nodeId: number,
        @Param('subscriptionId', new ParseIntPipe({ optional: true })) subscriptionId?: number,
    ) {
        return this.service.deleteSubsciberUsers(nodeId, subscriptionId)
    }

}