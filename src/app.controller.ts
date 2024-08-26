import { Controller, Get, Res } from '@nestjs/common';

import { Response } from 'express';
import { publicDir } from './lib/common.utils';

@Controller()
export class AppController {
    @Get()
    root(@Res() res: Response) {
        return res.sendFile(publicDir('index.app.html'));
    }

    @Get('/login')
    login(@Res() res: Response) {
        return res.sendFile(publicDir('index.login.html'));
    }

    @Get('/verify')
    verify(@Res() res: Response) {
        return res.sendFile(publicDir('index.verify.html'));
    }
}
