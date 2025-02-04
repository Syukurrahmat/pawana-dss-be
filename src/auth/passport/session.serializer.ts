import { PassportSerializer } from '@nestjs/passport';
import { UsersService } from '../../Api/users/users.service';
import { InjectModel } from '@nestjs/sequelize';
import Users from '../../models/users';

export default class SessionSerializer extends PassportSerializer {
    constructor(@InjectModel(Users) private usersDB: typeof Users) {
        super();
    }

    serializeUser(user: any, done: Function) {
        done(null, user);
    }
    async deserializeUser(payload: any, done: Function) {
        const user = await this.usersDB.findByPk(payload.userId);
        done(null, user);
    }
}
