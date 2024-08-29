import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    private logger = new Logger('Activity');


    use(req: Request, res: Response, next: NextFunction) {
        const { method, originalUrl } = req;
        const startTime = Date.now();

        const user = req.user
        const userInfo = user ? `${user.name} (${user.userId})` : 'Anonimous'

        res.on('finish', () => {
            const { statusCode } = res;
            const endTime = Date.now();
            const duration = `\x1b[33m+${endTime - startTime}ms\x1b[0m`;

            let logMessage = `${userInfo} {${originalUrl}, ${method}, ${statusCode}} ${duration}`;

            this.logger.log(logMessage);
        });

        next();
    }
}
