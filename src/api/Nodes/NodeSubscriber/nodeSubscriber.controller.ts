import { Controller, Delete, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../lib/pagination.dto.js';
import { NodeSubscriberService } from './nodeSubscriber.service.js';

@Controller('nodes/:id')
@ApiTags('nodes')
export class NodeSubscriberController {
    constructor(private readonly eachUserService: NodeSubscriberService) { }

    @Get('/companies')
    getSubsciberUsers(
        @Param('id', ParseIntPipe) nodeId: number,
        @Query() pagination: PaginationQueryDto,
    ) {
        this.eachUserService.getSubsciberUsers(nodeId, pagination)
    }

    @Delete('/companies/:subscriptionId?')
    deleteSubsciberUsers(
        @Param('id', ParseIntPipe) nodeId: number,
        @Param('subscriptionId', new ParseIntPipe({ optional: true })) subscriptionId?: number,
    ) {
        this.eachUserService.deleteSubsciberUsers(nodeId, subscriptionId)
    }


    @Get('/users')
    getSubsciberCompanies(
        @Param('id', ParseIntPipe) nodeId: number,
        @Query() pagination: PaginationQueryDto,
    ) {
        this.eachUserService.getSubsciberCompanies(nodeId, pagination)
    }

    @Delete('/users/:subscriptionId?')
    deleteSubsciberCompanies(
        @Param('id', ParseIntPipe) nodeId: number,
        @Param('subscriptionId', new ParseIntPipe({ optional: true })) subscriptionId?: number,
    ) {
        this.eachUserService.deleteSubsciberUsers(nodeId, subscriptionId)
    }

}