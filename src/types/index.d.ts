import Users from '../models/users.ts';
import { Request, Response, NextFunction } from 'express';

declare global {
    namespace Express {
        interface User extends Users { }
        interface Request {
            resource?: string;
        }
    }
}

declare module "express-session" {
    interface SessionData {
        activeDashboard: 'userSubs' | 'companySubs';
        activeCompany: {
            companyId: number,
            coordinate: number[],
            type: string,
            name: string,
        } | null;
        tz: string
    }
}

declare type ControllerType = (req: Request, res: Response, next: NextFunction) => void | any;

declare type QueryOfSting = { [key: string]: string }

