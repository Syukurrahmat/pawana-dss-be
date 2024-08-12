import { Body, Controller, Delete, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from '../decorator/user.decorator.js';
import Users from '../models/users.js';
import LocalAuthenticationGuard from './local.guard.js';
import { Request, Response } from 'express';

@Controller('auth')
@ApiTags('auth')
export class AuthController {

    @Get('/login')
    async get(@User() user: Users) {
        return await user.getCompanies()
    }

    @UseGuards(LocalAuthenticationGuard)
    @Post('/login')
    async login(
        @User() user: Users
    ) {
        const { password, ...result } = user.toJSON()
        return result
    }

    @Delete('/logout')
    logout(@Req() req: Request, @Res() res: Response) {
        req.logout((err) => {
            res.clearCookie('connect.sid');  
            res.status(200).send('Logout successful');
        });
    }
}
