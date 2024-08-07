import Users from '../../models/users'
import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Randomstring from 'randomstring';
import { InferAttributes, Op, Sequelize, WhereOptions } from 'sequelize';
import { CreateUserDto } from './dto/create-user.dto.js';
import { FindUserDto } from './dto/find-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { EmailService } from '../../services/email/email.service.js';
import Nodes from '../../models/nodes.js';
import Companies from '../../models/companies.js';
import { PaginationQueryDto } from '../../lib/pagination.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(Users)
        private usersDB: typeof Users,
        @InjectModel(Nodes)
        private nodesDB: typeof Nodes,

        private emailService: EmailService
    ) { }

    async create(createUserDto: CreateUserDto) {
        const { name, email, phone, description, address, profilePicture, role } = createUserDto;

        const emailAlreadyUsed = await this.usersDB.count({ where: { email } })
        if (emailAlreadyUsed) throw new ConflictException('Email already in use');

        const token = jwt.sign({ email }, process.env.JWT_SECRETKEY!, { expiresIn: '3d' });
        await this.emailService.sendVerificationEmail(name!, email!, token)

        const newUser = await this.usersDB.create({
            name: name!,
            email: email!,
            phone: phone!,
            address: address!,
            role: role!,
            description,
            profilePicture,
            password: Randomstring.generate(12),
        })

        if (!newUser) throw new UnprocessableEntityException('Data tidak bisa diproses');

        return 'success'
    }

    async findAll(filter: FindUserDto, pagination: PaginationQueryDto) {
        const { paginationObj, searchObj, getMetaData } = pagination
        const { role, unverified } = filter

        const whereOpt: WhereOptions<InferAttributes<Users>> = searchObj
        if (role) whereOpt.role = role
        if (unverified) whereOpt.isVerified = unverified

        const { count, rows } = await this.usersDB.findAndCountAll({
            attributes: ['userId', 'name', 'phone', 'profilePicture', 'email', 'role', 'createdAt'],
            where: whereOpt,
            ...paginationObj
        })

        return {
            rows,
            meta: getMetaData(pagination, count)
        };
    }

    async getAllUsersSummary() {
        const all = await this.usersDB.count()

        const userTypeEnum = ['admin', 'gov', 'manager', 'regular']
        const countEachRole = await this.usersDB.findAll({
            attributes: [
                'role',
                [Sequelize.fn('COUNT', Sequelize.col('role')), 'count']
            ],
            where: { isVerified: true },
            raw: true,
            group: 'role',
        });

        const countRole = userTypeEnum.map(e => ({
            value: e,
            count: countEachRole.find(({ role }) => role == e)?.count || 0
        }))

        countRole.push({
            value: 'unverified',
            count: await this.usersDB.count({ where: { isVerified: false } })
        })

        return { all, role: countRole }
    }

    

    async findOne(id: number) {
        const user = await this.getUser(id)
        const countSubscribedNodes = await user.countSubscribedNodes()
        const countManagedCompany = await user.countCompanies()

        return {
            ...user.toJSON(),
            countSubscribedNodes,
            countManagedCompany
        }
    }

    async update(id: number, updateUserDto: UpdateUserDto) {
        const user = await this.getUser(id)
        const { password, newPassword, ...data } = updateUserDto;

        await this.validatePasswords(user, password, newPassword)

        const [updated] = await this.usersDB
            .update(
                { ...data, password },
                { where: { userId: user.userId } }
            )

        if (!updated) throw new UnprocessableEntityException('Data tidak bisa diproses');

        return 'success'
    }

    async remove(id: number) {
        const user = await this.getUser(id)
        await user.destroy()

        return 'success'
    }

    async ownCompanies(id: number, pagination: PaginationQueryDto) {
        const user = await this.getUser(id)
        const { paginationObj, searchObj, getMetaData } = pagination

        const where = { ...searchObj }

        const [count, rows] = await Promise.all([
            user.countCompanies({ where }),
            user.getCompanies({
                attributes: ['companyId', 'name', 'type', 'createdAt', 'coordinate'],
                where,
                ...paginationObj
            }),
        ])

        return {
            rows,
            meta: getMetaData(pagination, count)
        };
    }


    async ownPrivateNodes(id: number, pagination: PaginationQueryDto) {
        const user = await this.getUser(id)
        const { paginationObj, searchObj, getMetaData } = pagination

        const companyIds = await user
            .getCompanies({ attributes: ['companyId'] })
            .then(e => e.map(f => f.companyId!))

        const where = {
            companyId: { [Op.in]: companyIds },
            ...searchObj
        }

        const [count, rows] = await Promise.all([
            this.nodesDB.count({where}),
            this.nodesDB.findAll({
                attributes: ['nodeId', 'isUptodate', 'name', 'createdAt', 'lastDataSent'],
                where,
                include: {
                    model: Companies,
                    as: 'owner',
                    attributes: ['name', 'companyId', 'type'],
                },
                ...paginationObj,
                order: [[{ model: Companies, as: 'owner' }, 'name', 'ASC']]
            })
        ])

        return {
            rows,
            meta: getMetaData(pagination, count)
        };
    }

    private async getUser(id: number) {
        const user = await this.usersDB.findOne({
            where: { userId: id, isVerified: true },
            attributes: { exclude: ['createdAt', 'updatedAt', 'password'] },
        })

        if (!user) throw new NotFoundException()
        return user
    }

    private async validatePasswords(user: Users, password?: string, newPassword?: string) {
        if ((password && !newPassword) || (!password && newPassword)) {
            throw new BadRequestException('Password dan Password baru harus diisi bersama-sama');
        }
        if (password && newPassword) {
            const userPassword = await this.usersDB
                .findByPk(user.userId, { attributes: ['userId', 'password'] })
                .then(e => e!.password)

            const passwordIsMatch = bcrypt.compareSync(password, userPassword)
            if (!passwordIsMatch) throw new UnauthorizedException('Password salah');
        }
    }

    public async findEmailAndPass(email: string) {
        return await this.usersDB.findOne({
            where: { email },
        })
    }
}
