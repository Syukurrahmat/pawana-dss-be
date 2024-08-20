import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import Companies from '../../models/companies';
import Users from '../../models/users';

@Injectable()
export class UserSessionMiddleware implements NestMiddleware {
    async use(req: Request, res: Response, next: NextFunction) {
        const user = req.user!;
        const { role } = user;

        if (req.session.viewCompany === undefined && role == 'manager') {
            const company = await user.getCompanies({
                attributes: ['companyId', 'coordinate', 'name', 'type'],
                limit: 1,
            });
            req.session.viewCompany = company[0] || null;
        }

        if (req.session.viewUser === undefined && (role == 'regular' || role == 'manager')) {
            const { userId, name, role } = user;
            req.session.viewUser = { userId, name, role };
        }

        if (req.session.tz === undefined) req.session.tz = 'Asia/Bangkok';

        next();
    }
}
