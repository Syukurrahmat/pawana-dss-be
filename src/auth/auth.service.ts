import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Users from '../models/users';
import randomstring from 'randomstring'

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(Users)
        private usersDB: typeof Users
    ) {
    }

    async verifyUser(token: string) {
        let payload = jwt.verify(token, process.env.JWT_SECRETKEY!) as any

        if (payload || payload?.email) {
            throw new BadRequestException('Token tidak valid')
        }

        const email = payload.email
        const user = await this.usersDB.findOne({ where: { email } })
        if (!user) throw new NotFoundException('Data pengguna tidak ditemukan')

        const password = randomstring.generate(12)

        user.password = password
        await user.save()
    }


    async validateUser(email: string, pass: string) {
        const user = await this.usersDB.findOne({ where: { email } })
        if (user && bcrypt.compareSync(pass, user.password)) {
            return user
        }
        return null;
    }
}
