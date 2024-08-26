import {
    Body,
    Controller,
    Get,
    Patch,
    Query,
    Session
} from '@nestjs/common';
import { SessionData } from 'express-session';
import { User } from '../../common/decorator/user.decorator';
import { ParseIntPipeOptional } from '../../common/pipe/ParseIntPipeOptional';
import Users from '../../models/users';
import { ApplicationService } from './app.service';

@Controller('/app')
export class ApplicationController {
    constructor(private readonly appService: ApplicationService) { }

    @Get('')
    getUserInformation(
        @Session() session: SessionData,
        @User() user: Users,
        @Query('timezone') timezone?: string
    ) {
        return this.appService.getUserInformation(user, session, timezone);
    }

    @Patch('configure-view')
    configureUserView(
        @Session() session: SessionData,
        @User() user: Users,
        @Body('companyId', ParseIntPipeOptional) companyId?: number,
        @Body('userId', ParseIntPipeOptional) userId?: number
    ) {
        return this.appService.configureUserView(user, session, companyId, userId);
    }
}
