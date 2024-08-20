import { Moment } from 'moment';
import { Request, Response, NextFunction } from 'express';
import { OrderItem } from 'sequelize';
import Companies from '../models/companies';
import Users from '../models/users';

declare global {
    namespace Express {
        interface User extends Users {}
        interface Request {
            resource?: string;
            company?: Companies;
            pagination?: Pagination;
        }
    }
}

declare module 'express-serve-static-core' {
    interface Request {
        moment: Moment;
    }
}

declare module 'express-session' {
    interface SessionData {
        viewCompany: {
            companyId?: number;
            coordinate: number[];
            type: string;
            name: string;
        } | null;
        viewUser: {
            userId?: number;
            role: string;
            name: string;
        } | null;
        tz: string;
    }
}

declare type ControllerType = (req: Request, res: Response, next: NextFunction) => void | any;

declare type QueryOfSting = { [key: string]: string };

type UserRole = 'gov' | 'regular' | 'manager' | 'admin';

type Pagination = {
    page: number;
    limit: number;
    offset: number;
    search: Record<string, any>;
    order: OrderItem[];
};

type APIResponse<T = any> = {
    statusCode: number;
    message: string;
    error: string | null;
    data: T;
};

type Paginated = {
    rows: any[];
    meta: MetaPaginated;
};
type MetaPaginated = {
    total: number;
    totalPage: number;
    page: number;
    search: string | undefined;
    limit: number;
    prev: number | null;
    next: number | null;
};
