import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { Request as RequestType } from 'express';
import LocalAuthenticationGuard from './local.guard.js';

@Controller('auth')
export class AuthController {
    constructor() { }

    


    @UseGuards(LocalAuthenticationGuard)
    @Post('/login')
    async login(@Request() req: RequestType) {
        return req.user;
    }
}
