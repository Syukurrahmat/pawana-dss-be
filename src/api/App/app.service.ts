import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SessionData } from 'express-session';
import moment from 'moment';
import Companies from '../../models/companies';
import Users from '../../models/users';

@Injectable()
export class ApplicationService {
    private companyAttr = ['companyId', 'coordinate', 'name', 'type', 'managedBy']
    private userAttr = ['userId', 'role', 'name']

    constructor(
        @InjectModel(Companies) private companiesDb: typeof Companies,
        @InjectModel(Users) private usersDb: typeof Users
    ) { }

    getUserInformation(user: Users, session: SessionData, timezoneQuery: string | undefined) {
        const { password, address, description, ...rest } = user.toJSON();
        const { role } = rest;

        if (timezoneQuery && moment.tz.zone(timezoneQuery)) {
            session.tz = timezoneQuery;
        }

        return {
            ...rest,
            role,
            view: {
                company: session.viewCompany,
                user: session.viewUser,
            },
        };
    }

    async configureUserView(
        user: Users,
        session: SessionData,
        companyId: number | undefined,
        userId: number | undefined
    ) {
        const { role } = user.toJSON();

        if (role === 'regular') throw new ForbiddenException('Tidak diizinkan')
        if (!companyId && !userId) throw new BadRequestException('companyId atau userId harus Ada')

        if (companyId) {
            const company = await this.companiesDb.findByPk(companyId, {
                attributes: this.companyAttr,
            });

            if (!company) throw new NotFoundException('companies not found');
            if (role == 'manager' && !user.hasCompany(company)) throw new ForbiddenException();
            session.viewCompany = company.toJSON();

            if (role == 'admin' || role == 'gov') {
                const managerCompany = await this.usersDb.findByPk(company.managedBy, {
                    attributes: this.userAttr,
                });

                if (!managerCompany) {
                    throw new UnprocessableEntityException('Data tidak bisa diproses');
                }
                session.viewUser = managerCompany.toJSON();
            }
        }

        if (userId) {
            if (role == 'manager') throw new ForbiddenException('Tidak diizinkan')

            const user = await Users.findOne({
                where: { role: 'regular', userId },
                attributes: this.userAttr,
            });
            if (!user) throw new BadRequestException('users not found');
            
            session.viewUser = user.toJSON();
            session.viewCompany = null
        }

        return {
            view: {
                company: session.viewCompany,
                user: session.viewUser,
            },
        };
    }
}
