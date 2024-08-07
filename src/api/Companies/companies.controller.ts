import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { CompaniesService } from './companies.service.js';
import { PaginationQueryDto } from '../../lib/pagination.dto.js';
import { ApiTags } from '@nestjs/swagger';
import { User } from '../../decorator/user.decorator.js';
import Users from '../../models/users.js';
import { CreateCompaniesDto } from './dto/create-companies.dto.js';
import { FindCompaniesDto } from './dto/find-companies.dto.js';
import { UpdateCompaniesDto } from './dto/update-companies.dto.js';

@Controller('companies')
@ApiTags('companies')
export class CompaniesController {
    constructor(private readonly usersService: CompaniesService) { }

    @Post('/')
    create(@Body() createDto: CreateCompaniesDto) {
        return this.usersService.create(createDto);
    }

    @Get('/')
    async findAll(
        @Query() pagination: PaginationQueryDto,
        @Query() filter: FindCompaniesDto,
    ) {
        return this.usersService.findAll(filter, pagination);
    }

    @Get('/summary')
    getsummary() {
        return this.usersService.getAllUsersSummary()
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateCompaniesDto) {
        return this.usersService.update(id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.remove(id);
    }

    @Get(':id/private-nodes')
    ownCompanies(
        @Param('id', ParseIntPipe) id: number,
        @Query() pagination: PaginationQueryDto,
    ) {
        return this.usersService.getPrivateNodes(id, pagination)
    }
}
