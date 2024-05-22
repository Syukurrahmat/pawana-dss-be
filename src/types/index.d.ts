import { InferAttributes } from 'sequelize';
import Users from '../models/users.ts';
import { Request, Response, NextFunction } from 'express';

declare global {
    namespace Express {
        interface User
            extends InferAttributes<Users, { omit: never }> { }
    }
}

declare type ControllerType = (req: Request, res: Response, next: NextFunction) => void | any;




