import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../api/Users/users.service';
import { InjectModel } from '@nestjs/sequelize';
import Users from '../models/users';

@Injectable()
export class AuthService {
    constructor(@InjectModel(Users) private usersDB: typeof Users) {
    }
    async validateUser(email: string, pass: string) {
        const user = await this.usersDB.findOne({ where: { email } })
        if (user && bcrypt.compareSync(pass, user.password)) {
            return user
        }
        return null;
    }
}
