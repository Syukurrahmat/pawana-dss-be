import { InferAttributes } from 'sequelize';
import Users from '../models/users.ts';

import { Request } from 'express';

declare global {
    namespace Express {
        interface User
            extends InferAttributes<
                Users,
                {
                    omit: never;
                }
            > {}
    }
}
