import { Controller, Delete, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { User } from '../common/decorator/user.decorator.js';
import Users from '../models/users.js';
import { AuthService } from './auth.service.js';
import LocalAuthenticationGuard from './local.guard.js';

@Controller('')
@ApiTags('auth')
export class AuthController {
    constructor(private service: AuthService) { }

    @UseGuards(LocalAuthenticationGuard)
    @Post('/login')
    async login(@User() user: Users) {
        const { password, ...result } = user.toJSON();
        return result;
    }

    @Get('/verify/:token')
    async verify(
        @Param('token') token: string
    ) {
        return this.service.verifyUser(token).then(e => {

        }).catch(e => {
            console.log('eheheheh',e )
        })
    }

    @Delete('/logout')
    logout(@Req() req: Request, @Res() res: Response) {
        req.logout(() => {
            res.clearCookie('connect.sid');
            res.status(200).send('Logout successful');
        });
    }
}
