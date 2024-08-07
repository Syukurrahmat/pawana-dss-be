import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subs.dto.js';
import { PaginationQueryDto } from '../../../lib/pagination.dto.js';
import { ApiTags } from '@nestjs/swagger';
import { UserNodeSubsService } from './userNodeSubs.service.js';

@Controller('users/:id/nodes')
@ApiTags('users subscription')
export class UserNodeSubsController {
    constructor(private readonly services: UserNodeSubsService) { }

    @Get('/')
    getSubscibedPublicNodes(
        @Param('id', ParseIntPipe) userId : number,
        @Query() pagination: PaginationQueryDto,
    ) {
        this.services.getSubscribedNodes(userId, pagination)
    }
   
    @Post('/')
    createNodeSubscription(
        @Param('id', ParseIntPipe) userId : number,
        @Body() createSubsDto : CreateSubscriptionDto,
    ) {
        this.services.createNodeSubscription(userId, createSubsDto)
    }

    @Delete('/:subscriptionId')
    deleteSubscibedPublicNodes(
        @Param('id', ParseIntPipe) userId : number,
        @Param('subscriptionId', ParseIntPipe) subscriptionId : number,
    ) {
        this.services.removeNodeSubscription(userId, subscriptionId)
    }

    @Get('/limit')
    getRemainingSubsLimit(@Param('id', ParseIntPipe) userId: number) {
        this.services.getRemainingSubsLimit(userId)
    }
}