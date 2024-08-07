import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subs.dto.js';
import { PaginationQueryDto } from '../../../lib/pagination.dto.js';
import { ApiTags } from '@nestjs/swagger';
import { UserNodeSubsService } from './userNodeSubs.service.js';

@Controller('users/:id')
@ApiTags('users subscription')
export class UserNodeSubsController {
    constructor(private readonly eachUserService: UserNodeSubsService) { }

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