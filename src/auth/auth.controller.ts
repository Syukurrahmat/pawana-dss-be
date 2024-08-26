import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { User } from '../common/decorator/user.decorator.js';
import Users from '../models/users.js';
import { AuthService } from './auth.service.js';
import LocalAuthenticationGuard from './local.guard.js';

@Controller('')
@ApiTags('auth')
export class AuthController {
    constructor(private service: AuthService) {}

    @Post('/login')
    @UseGuards(LocalAuthenticationGuard)
    async login(@User() user: Users) {
        const { password, ...result } = user.toJSON();
        return result;
    }

    @Post('/verify')
    @HttpCode(200)
    async verify(@Body('token') token: string) {
        return this.service.verifyUser(token);
    }

    @Delete('/logout')
    logout(@Req() req: Request, @Res() res: Response) {
        req.logout(() => {
            res.clearCookie('connect.sid');
            res.status(200).send('Logout successful');
        });
    }
}
