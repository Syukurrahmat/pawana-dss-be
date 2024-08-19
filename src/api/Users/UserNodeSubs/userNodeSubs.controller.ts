import { Body, Controller, Delete, Get, Param, ParseBoolPipe, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subs.dto.js';
import { PaginationQueryDto } from '../../../lib/pagination.dto.js';
import { ApiTags } from '@nestjs/swagger';
import { UserNodeSubsService } from './userNodeSubs.service.js';
import { UserGuard } from '../user.guard.js';

// ============= api/users/:id/nodes =============

@Controller('/')
@UseGuards(UserGuard)
@ApiTags('Users subscription')
export class UserNodeSubsController {
    constructor(private readonly services: UserNodeSubsService) { }

    @Get('/')
    getSubscibedPublicNodes(
        @Param('id', ParseIntPipe) userId: number,
        @Query() pagination: PaginationQueryDto,
    ) {
        return this.services.getSubscribedNodes(userId, pagination)
    }

    @Patch('/')
    createNodeSubscription(
        @Param('id', ParseIntPipe) userId: number,
        @Body() createSubsDto: CreateSubscriptionDto,
    ) {
        console.log('ssjsjssj')
        return this.services.createNodeSubscription(userId, createSubsDto)
    }

    @Delete('/:subscriptionId')
    deleteSubscibedPublicNodes(
        @Param('id', ParseIntPipe) userId: number,
        @Param('subscriptionId', ParseIntPipe) subscriptionId: number,
    ) {
        return this.services.removeNodeSubscription(userId, subscriptionId)
    }

    @Get('/limit')
    getRemainingSubsLimit(@Param('id', ParseIntPipe) userId: number) {
        return this.services.getRemainingSubsLimit(userId)
    }
}