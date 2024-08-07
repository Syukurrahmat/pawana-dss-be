import { Controller, Get, Post, Body, Patch, Param, Delete, Session, Query, ParseIntPipe } from '@nestjs/common';
import { ApplicationService } from './app.service';
import { SessionData } from 'express-session';
import { User } from '../../decorator/user.decorator';
import Users from '../../models/users';

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
        @Body('companyId', new ParseIntPipe({ optional: true })) companyId? : number
    ) {
        return this.appService.configureUserView(user, session, companyId)
    }
}
