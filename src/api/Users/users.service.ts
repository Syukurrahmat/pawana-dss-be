import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Randomstring from 'randomstring';
import { InferAttributes, Op, Sequelize, WhereOptions } from 'sequelize';
import { PaginationQueryDto } from '../../lib/pagination.dto';
import Companies from '../../models/companies.js';
import Nodes from '../../models/nodes.js';
import Users from '../../models/users';
import { DashboardService } from '../../services/Dashboard/Dashboard.service';
import { EmailService } from '../../services/Email/Email.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { FindCompaniesDto } from './dto/find-companies.dto';
import { FindUserDto } from './dto/find-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(Users)
        private usersDB: typeof Users,
        @InjectModel(Nodes)
        private nodesDB: typeof Nodes,

        private dashboardService: DashboardService,
        private emailService: EmailService,
        // private sequelize: Sequelize,
    ) { }

    async create(createUserDto: CreateUserDto) {
        const { name, email, phone, description, address, profilePicture, role } = createUserDto;

        const emailAlreadyUsed = await this.usersDB.count({ where: { email } });
        if (emailAlreadyUsed)
            throw new BadRequestException({
                message: ['email', 'Email telah digunakan pengguna lain'],
            });

        const token = jwt.sign({ email }, process.env.JWT_SECRETKEY!, { expiresIn: '7 days' });
        await this.emailService.sendVerificationEmail(name!, email!, token);

        const newUser = await this.usersDB.create({
            name: name!,
            email: email!,
            phone: phone!,
            address: address!,
            role: role!,
            description,
            profilePicture,
            password: Randomstring.generate(12),
        });

        if (!newUser) throw new UnprocessableEntityException('Data tidak bisa diproses');

        return { userId: newUser.userId };
    }

    async findAll(filter: FindUserDto, pagination: PaginationQueryDto) {
        const { paginationObj, searchObj, getMetaData } = pagination;
        const { role, unverified, view } = filter;

        const whereOpt: WhereOptions<InferAttributes<Users>> = searchObj;
        if (role) whereOpt.role = role;
        if (unverified) whereOpt.isVerified = !unverified;

        const attributes =
            view == 'all'
                ? ['userId', 'name', 'phone', 'profilePicture', 'email', 'role', 'createdAt']
                : ['userId', 'profilePicture', 'name'];

        const { count, rows } = await this.usersDB
            .findAndCountAll({
                attributes,
                where: whereOpt,
                ...paginationObj,
            })
            .catch(() => { throw new BadRequestException() })

        return {
            rows,
            meta: getMetaData(pagination, count),
        };
    }

    async getOverview() {
        const all = await this.usersDB.count();

        const userTypeEnum = ['admin', 'gov', 'manager', 'regular'];
        const countEachRole = await this.usersDB.findAll({
            attributes: ['role', [Sequelize.fn('COUNT', Sequelize.col('role')), 'count']],
            where: { isVerified: true },
            raw: true,
            group: 'role',
        });

        const countRole = userTypeEnum.map((e) => ({
            value: e,
            count: countEachRole.find(({ role }) => role == e)?.count || 0,
        }));

        countRole.push({
            value: 'unverified',
            count: await this.usersDB.count({ where: { isVerified: false } }),
        });

        return { all, role: countRole };
    }

    async findOne(id: number) {
        const user = await this.getUser(id);
        const countSubscribedNodes = await user.countSubscribedNodes();
        const countManagedCompany = await user.countCompanies();

        return {
            ...user.toJSON(),
            countSubscribedNodes,
            countManagedCompany,
        };
    }

    async update(id: number, updateUserDto: UpdateUserDto) {
        const user = await this.getUser(id);
        const { password, newPassword, ...data } = updateUserDto;

        if (password) await this.validatePasswords(user, password, newPassword);

        const [updated] = await this.usersDB.update(
            { ...data, password: newPassword },
            { where: { userId: user.userId } }
        );

        if (!updated) throw new UnprocessableEntityException('Data tidak bisa diproses');

        return 'success';
    }

    async remove(id: number) {
        const user = await this.getUser(id);

        // const t = await this.sequelize.transaction();

        // try {
        //     // Hapus data yang terkait terlebih dahulu
        //     await Nodes.destroy({ where: { companyId }, transaction: t });

        //     // Hapus data utama
        //     await Company.destroy({ where: { companyId }, transaction: t });

        //     // Komit transaksi
        //     await t.commit();
        // } catch (error) {
        //     // Rollback jika terjadi error
        //     await t.rollback();
        //     throw error;
        // }

        await user.destroy();

        return 'success';
    }

    async ownCompanies(id: number, pagination: PaginationQueryDto, { view }: FindCompaniesDto) {
        const user = await this.getUser(id);
        const { paginationObj, searchObj, getMetaData } = pagination;

        const attributes =
            view == 'all'
                ? ['companyId', 'name', 'type', 'createdAt', 'coordinate']
                : ['companyId', 'name', 'type', 'coordinate'];

        const where = { ...searchObj };

        const [count, rows] = await Promise.all([
            user.countCompanies({ where }),
            user.getCompanies({
                attributes,
                where,
                ...paginationObj,
            }),
        ]);

        return {
            rows,
            meta: getMetaData(pagination, count),
        };
    }

    async ownPrivateNodes(id: number, pagination: PaginationQueryDto) {
        const user = await this.getUser(id);
        const { paginationObj, searchObj, getMetaData } = pagination;

        const companyIds = await user
            .getCompanies({ attributes: ['companyId'] })
            .then((e) => e.map((f) => f.companyId!));

        const where = {
            companyId: { [Op.in]: companyIds },
            ...searchObj,
        };

        const [count, rows] = await Promise.all([
            this.nodesDB.count({ where }),
            this.nodesDB.findAll({
                attributes: ['nodeId', 'isUptodate', 'name', 'createdAt', 'lastDataSent'],
                where,
                include: {
                    model: Companies,
                    as: 'owner',
                    attributes: ['name', 'companyId', 'type'],
                },
                ...paginationObj,
                order: [[{ model: Companies, as: 'owner' }, 'name', 'ASC']],
            }),
        ]);

        return {
            rows,
            meta: getMetaData(pagination, count),
        };
    }

    async getDashboardData(id: number, tz: string) {
        const user = await this.getUser(id);
        return await this.dashboardService.forRegularUser(user, tz);
    }

    private async getUser(id: number) {
        const user = await this.usersDB.findOne({
            where: { userId: id, isVerified: true },
            attributes: { exclude: ['createdAt', 'updatedAt', 'password'] },
        });

        if (!user) throw new NotFoundException();
        return user;
    }

    private async validatePasswords(user: Users, password: string, newPassword?: string) {
        if ((password && !newPassword) || (!password && newPassword)) {
            throw new BadRequestException('Password dan Password baru harus diisi bersama-sama');
        }
        if (password && newPassword) {
            const userPassword = await this.usersDB
                .findByPk(user.userId, { attributes: ['userId', 'password'] })
                .then((e) => e!.password);

            const passwordIsMatch = bcrypt.compareSync(password, userPassword);
            if (!passwordIsMatch) throw new ForbiddenException('Password salah');
        }
    }

    public async findEmailAndPass(email: string) {
        return await this.usersDB.findOne({
            where: { email },
        });
    }
}
