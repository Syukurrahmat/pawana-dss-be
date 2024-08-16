import { Controller, Get, Post, Body, Patch, Param, Delete, Session, Query, ParseIntPipe } from '@nestjs/common';
import { ApplicationService } from './app.service';
import { SessionData } from 'express-session';
import { User } from '../../decorator/user.decorator';
import Users from '../../models/users';
import { ParseIntPipeOptional } from '../../pipe/ParseIntPipeOptional';

@Controller('/app')
export class ApplicationController {
    constructor(private readonly appService: ApplicationService) { }

    @Get('')
    getUserInformation(
        @Session() session: SessionData,
        @User() user: Users,
        @Query('timezone') timezone?: string,
    ) {
        return this.appService.getUserInformation(user, session, timezone)
    }

    @Patch('configure-view')
    configureUserView(
        @Session() session: SessionData,
        @User() user: Users,
        @Body('companyId', ParseIntPipeOptional) companyId? : number
    ) {
        console.log(11111111,session.viewCompany)

        return this.appService.configureUserView(user, session, companyId)
    }
}
