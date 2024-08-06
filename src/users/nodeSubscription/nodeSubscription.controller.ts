import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { NodeSubscriptionService } from './nodeSubscription.service.js';
import { PaginationQueryDto } from '@/dto/pagination.dto.js';
import { CreateSubscriptionDto } from './dto/create-subs.dto.js';

@Controller('users/:id')
export class NodeSubscriptionController {
    constructor(private readonly eachUserService: NodeSubscriptionService) { }

    @Get('/nodes')
    getSubscibedPublicNodes(
        @Param('id', ParseIntPipe) userId : number,
        @Query() pagination: PaginationQueryDto,
    ) {
        this.eachUserService.getSubscribedNodes(userId, pagination)
    }
   
    @Post('/nodes')
    createNodeSubscription(
        @Param('id', ParseIntPipe) userId : number,
        @Body() createSubsDto : CreateSubscriptionDto,
    ) {
        this.eachUserService.createNodeSubscription(userId, createSubsDto)
    }

    @Delete('/nodes/:subscriptionId')
    deleteSubscibedPublicNodes(
        @Param('id', ParseIntPipe) userId : number,
        @Param('subscriptionId', ParseIntPipe) subscriptionId : number,
    ) {
        this.eachUserService.removeNodeSubscription(userId, subscriptionId)
    }
}