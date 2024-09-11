import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Users from '../models/users';
import randomstring from 'randomstring';
import { EmailService } from '../services/Email/Email.service';
import { getUserRoleName } from '../lib/common.utils';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(Users)
        private usersDB: typeof Users,
        private emailService: EmailService
    ) { }

    async verifyUser(token: string) {
        const payload = await new Promise<any>((res, rej) =>
            jwt.verify(token, process.env.JWT_SECRETKEY!, (err, decoded) =>
                err ? rej(err) : res(decoded)
            )
        ).catch((e) => {
            if (e.name === 'TokenExpiredError') throw new UnauthorizedException('Expired token');
            else throw new BadRequestException('Token tidak valid');
        });

        const email = payload.email;
        const user = await this.usersDB.findOne({ where: { email } });

        if (!user) throw new NotFoundException('Data pengguna tidak ditemukan');
        if (user.isVerified) throw new ConflictException('Pengguna telah diverifikasi');

        const userRole = getUserRoleName(user.role)
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
