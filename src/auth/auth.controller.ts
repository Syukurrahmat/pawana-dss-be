import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from '../decorator/user.decorator.js';
import Users from '../models/users.js';
import LocalAuthenticationGuard from './local.guard.js';

@Controller('auth')
@ApiTags('auth')
export class AuthController {

    @Get('/login')
    async gett(@User() user: Users) {
        return await user.getCompanies()
    }

    @UseGuards(LocalAuthenticationGuard)
    @Post('/login')
    async login(
        @Body('email') email: string,
        @Body('password') passwword: string,
        @User() user: Users
    ) {
        const { password, ...result } = user.toJSON()
        return result
    }
}
