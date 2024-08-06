import { Moment } from 'moment';
import Users from '../_models/users.ts';
import { Request, Response, NextFunction } from 'express';
import Companies from '../_models/companies.ts';
import { OrderItem } from 'sequelize';

declare global {
    namespace Express {
        interface User extends Users { }
        interface Request {
            resource?: string;
            company?: Companies,
            pagination?: Pagination

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

type UserRole = 'gov' | 'regular' | 'manager' | 'admin'

type Pagination = {
    page: number;
    limit: number;
    offset: number;
    search: Record<string, any>
    order: OrderItem[];
}