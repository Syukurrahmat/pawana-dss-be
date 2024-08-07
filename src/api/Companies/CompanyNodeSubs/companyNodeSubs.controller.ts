import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { CompanyNodeSubsService } from './companyNodeSubs.service.js';
import { CreateSubscriptionDto } from './dto/create-subs.dto.js';
import { PaginationQueryDto } from '../../../lib/pagination.dto.js';
import { ApiTags } from '@nestjs/swagger';

@Controller('companies/:id/nodes')
@ApiTags('companies subscription')
export class CompanyNodeSubsController {
    constructor(private readonly services: CompanyNodeSubsService) { }

    @Get('/')
    getSubscibedPublicNodes(
        @Param('id', ParseIntPipe) companyId: number,
        @Query() pagination: PaginationQueryDto,
    ) {
        this.services.getSubscribedNodes(companyId, pagination)
    }

    @Post('/')
    createNodeSubscription(
        @Param('id', ParseIntPipe) companyId: number,
        @Body() createSubsDto: CreateSubscriptionDto,
    ) {
        this.services.createNodeSubscription(companyId, createSubsDto)
    }

    @Get('/limit')
    getRemainingSubsLimit(@Param('id', ParseIntPipe) companyId: number) {
        this.services.getRemainingSubsLimit(companyId)
    }

    @Delete('/:subscriptionId')
    deleteSubscibedPublicNodes(
        @Param('id', ParseIntPipe) companyId: number,
        @Param('subscriptionId', ParseIntPipe) subscriptionId: number,
    ) {
        this.services.removeNodeSubscription(companyId, subscriptionId)
    }
}