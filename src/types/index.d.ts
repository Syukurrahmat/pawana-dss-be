import { Moment } from 'moment';
import Users from '../models/users.ts';
import { Request, Response, NextFunction } from 'express';
import Companies from '../models/companies.ts';

declare global {
    namespace Express {
        interface User extends Users { }
        interface Request {
            resource?: string;
            company?: Companies,
        }
    }
}


declare module 'express-serve-static-core' {
    interface Request {
        moment: Moment;
    }
}

declare module "express-session" {
    interface SessionData {
        viewCompany: {
            companyId?: number,
            coordinate: number[],
            type: string,
            name: string,
        } | null;
        viewUser: {
            userId?: number,
            role: string,
            name: string,
        } | null;
        tz: string
    }
}

declare type ControllerType = (req: Request, res: Response, next: NextFunction) => void | any;

declare type QueryOfSting = { [key: string]: string }

