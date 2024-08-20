import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SessionData } from 'express-session';
import moment from 'moment';
import Companies from '../../models/companies';
import Users from '../../models/users';

@Injectable()
export class ApplicationService {
    constructor(
        @InjectModel(Companies) private companiesDb: typeof Companies,
        @InjectModel(Users) private usersDb: typeof Users
    ) {}

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

        if (companyId) {
            const company = await this.companiesDb.findByPk(companyId, {
                attributes: ['companyId', 'coordinate', 'name', 'type', 'managedBy'],
            });

            if (!company) throw new BadRequestException('companies not found');
            if (role == 'manager' && !user.hasCompany(company)) throw new ForbiddenException();

            session.viewCompany = company.toJSON();

            if (role == 'admin' || role == 'gov') {
                const managerCompany = await this.usersDb.findByPk(company.managedBy, {
                    attributes: ['userId', 'role', 'name'],
                });

                if (!managerCompany)
                    throw new UnprocessableEntityException('Data tidak bisa diproses');
                session.viewUser = managerCompany;
            }
        }
        if (userId) {
            if (role != 'admin' && role !== 'gov') throw new ForbiddenException();

            const user = await Users.findOne({
                where: { role: 'regular', userId },
                attributes: ['userId', 'role', 'name'],
            });
            if (!user) throw new BadRequestException('companies not found');

            session.viewUser = user;
        }

        console.log(11111111, session.viewCompany);
        return {
            view: {
                company: session.viewCompany,
                user: session.viewUser,
            },
        };
    }
}
