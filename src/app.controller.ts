import { Controller, Get, Req, Res } from '@nestjs/common';

import { Request, Response } from 'express';
import { publicDir } from './lib/common.utils';

@Controller()
export class AppController {
    @Get('/')
    root(@Res() res: Response) {
        return res.sendFile(publicDir('index.app.html'));
    }

    @Get('/login')
    login(@Req() req: Request, @Res() res: Response,) {
        if (req.isAuthenticated()) return res.redirect('/')
        return res.sendFile(publicDir('index.login.html'));
    }

    @Get('/verify')
    verify(@Req() req: Request, @Res() res: Response) {
        if (req.isAuthenticated()) return res.redirect('/')
        return res.sendFile(publicDir('index.verify.html'));
    }
}
