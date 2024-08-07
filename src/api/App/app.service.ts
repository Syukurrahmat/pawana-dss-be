import { BadRequestException, Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import moment from 'moment';
import Users from '../../models/users';
import { SessionData } from 'express-session';
import { InjectModel } from '@nestjs/sequelize';
import Companies from '../../models/companies';

@Injectable()
export class ApplicationService {
    constructor(
        @InjectModel(Companies) private companiesDb: typeof Companies,
        @InjectModel(Users) private usersDb: typeof Users
    ) {

    }

    getUserInformation(user: Users, session: SessionData, timezoneQuery: string | undefined,) {
        const { password, address, description, ...rest } = user
        const { role } = rest

        if (timezoneQuery && moment.tz.zone(timezoneQuery)) {
            session.tz = timezoneQuery;
        }

        return {
            ...rest,
            role,
            view: {
                company: session.viewCompany,
                user: session.viewUser
            }
        }

    }


    async configureUserView(user: Users, session: SessionData, companyId: number | undefined) {
        const { role } = user

        if (companyId) {
            const company = await this.companiesDb.findByPk(companyId, {
                attributes: ['companyId', 'coordinate', 'name', 'type', 'managedBy']
            });

            if (!company) {
                throw new BadRequestException('companies not found')
            }

            if (role == 'manager' && !user.hasCompany(company)) {
                throw new UnauthorizedException()
            }

            session.viewCompany = company.toJSON();

            if (role == 'admin' || role == 'gov') {
                const managerCompany = await this.usersDb.findByPk(company.managedBy, {
                    attributes: ['userId', 'role', 'name']
                })

                if (!managerCompany) throw new UnprocessableEntityException('Data tidak bisa diproses');
                session.viewUser = managerCompany
            }
        }

        return {
            view: {
                company: session.viewCompany,
                user: session.viewUser
            }
        }
    };
}
