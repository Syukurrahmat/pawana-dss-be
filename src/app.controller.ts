import { Controller, Get, UseGuards } from '@nestjs/common';
import LocalAuthGuard from './_auth/auth.guard';
import { UserId } from './decorator/user.decorator';

// @UseGuards(LocalAuthGuard)
@Controller()
export class AppController {
    constructor() { }

    

    @Get('/app')
    getHello(@UserId() user: any) {
        
        // console.log(user.())
        return 'ss'
    }
}
