import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Query,
    UseGuards
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../lib/pagination.dto.js';
import { CompanyGuard } from '../companies.guard.js';
import { CompanyNodeSubsService } from './companyNodeSubs.service.js';
import { CreateSubscriptionDto } from './dto/create-subs.dto.js';

// ==================== api/companies/:id/nodes/ ==================

@Controller('/')
@UseGuards(CompanyGuard)
@ApiTags('Companies subscription')
export class CompanyNodeSubsController {
    constructor(private readonly services: CompanyNodeSubsService) {}

    @Get('/')
    getSubscibedPublicNodes(
        @Param('id', ParseIntPipe) companyId: number,
        @Query() pagination: PaginationQueryDto
    ) {
        return this.services.getSubscribedNodes(companyId, pagination);
    }

    @Patch('/')
    createNodeSubscription(
        @Param('id', ParseIntPipe) companyId: number,
        @Body() createSubsDto: CreateSubscriptionDto
    ) {
        return this.services.createNodeSubscription(companyId, createSubsDto);
    }

    @Get('/limit')
    getRemainingSubsLimit(@Param('id', ParseIntPipe) companyId: number) {
        return this.services.getRemainingSubsLimit(companyId);
    }

    @Delete('/:subscriptionId')
    deleteSubscibedPublicNodes(
        @Param('id', ParseIntPipe) companyId: number,
        @Param('subscriptionId', ParseIntPipe) subscriptionId: number
    ) {
        return this.services.removeNodeSubscription(companyId, subscriptionId);
    }
}
