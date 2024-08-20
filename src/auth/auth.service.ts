import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Users from '../models/users';
import randomstring from 'randomstring';
import { EmailService } from '../services/Email/Email.service';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(Users)
        private usersDB: typeof Users,
        private emailService: EmailService
    ) {}

    async verifyUser(token: string) {
        let payload = jwt.verify(token, process.env.JWT_SECRETKEY!) as any;

        if (!payload || !payload?.email) {
            throw new BadRequestException('Token tidak valid');
        }

        const email = payload.email;
        const user = await this.usersDB.findOne({ where: { email } });
        if (!user) throw new NotFoundException('Data pengguna tidak ditemukan');

        const userRole =
            user.role == 'admin'
                ? 'Administrator'
                : user.role == 'gov'
                  ? 'Pemerintah'
                  : user.role == 'manager'
                    ? 'Pemilik Usaha'
                    : 'Pengguna Publik';
        const password = randomstring.generate(12);

        user.isVerified = true;
        user.password = password;
        await user.save();

        await this.emailService.sendSuccessVerificationEmail(user.name, email, password, userRole);
        return 'success';
    }

    async validateUser(email: string, pass: string) {
        const user = await this.usersDB.findOne({ where: { email } });
        if (user && bcrypt.compareSync(pass, user.password)) {
            return user;
        }
        return null;
    }
}
