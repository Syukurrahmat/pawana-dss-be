import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { Request as RequestType } from 'express';
import LocalAuthenticationGuard from './local.guard.js';
import { User } from '../decorator/user.decorator.js';
import Users from '../models/users.js';
import { ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('auth')
export class AuthController {

    @Get('/login')
    async gett(@User() user: Users ) {
        return await user.getCompanies()
    }

    @UseGuards(LocalAuthenticationGuard)
    @Post('/login')
    async login(@User() user: Users) {
        const { password, ...result } = user.toJSON()
        return result
    }
}
