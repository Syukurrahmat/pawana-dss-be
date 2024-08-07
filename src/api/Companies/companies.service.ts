import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FindOptions, InferAttributes, Sequelize } from 'sequelize';
import { PaginationQueryDto } from '../../lib/pagination.dto.js';
import Companies from '../../models/companies.js';
import Users from '../../models/users.js';
import { CreateCompaniesDto } from './dto/create-companies.dto.js';
import { FindCompaniesDto } from './dto/find-companies.dto.js';
import { UpdateCompaniesDto } from './dto/update-companies.dto.js';

@Injectable()
export class CompaniesService {
    constructor(
        @InjectModel(Companies)
        private CompaniesDB: typeof Companies,
    ) { }

    async create(createDto: CreateCompaniesDto) {
        const { name, description, address, type, managerId: managedBy, coordinate } = createDto;

        const newCompany = await this.CompaniesDB.create({
            name: name!,
            description: description!,
            address: address!,
            type: type!,
            coordinate: coordinate!,
            managedBy: managedBy!
        })

        if (!newCompany) throw new UnprocessableEntityException('Data tidak bisa diproses');
        return 'success'
    }

    async findAll(filter: FindCompaniesDto, pagination: PaginationQueryDto) {
        const { paginationObj, searchObj, getMetaData } = pagination
        const { all } = filter

        const paginateObj = all ? {} : paginationObj

        const { count, rows } = await this.CompaniesDB.findAndCountAll({
            attributes: { exclude: ['updatedAt', 'description'] },
            include: {
                model: Users,
                attributes: ['userId', 'name', 'profilePicture']
            },
            where: { ...searchObj },
            ...paginateObj
        })

        return {
            rows,
            meta: getMetaData(pagination, count)
        };
    }

    async getAllUsersSummary() {
        const all = await this.CompaniesDB.count()

        const companyTypeEnum = ['tofufactory', 'service', 'agriculture', 'retailstore', 'restaurant', 'other']
        const countEachType = await this.CompaniesDB.findAll({
            attributes: [
                'type',
                [Sequelize.fn('COUNT', Sequelize.col('type')), 'count']
            ],
            group: 'type',
            raw: true
        });

        const type = companyTypeEnum.map(e => ({
            value: e,
            count: countEachType.find(({ type }) => type == e)?.count || 0
        }))

        return { all, type }
    }


    async findOne(id: number) {
        const company = await this.getCompany(id, {
            include: {
                model: Users,
                attributes: ['name', 'userId', 'phone', 'profilePicture', 'email'],
            },
        })

        const countSubscribedNodes = await company.countSubscribedNodes()

        return {
            ...company.toJSON(),
            countSubscribedNodes,
        }
    }

    async update(id: number, updateDto: UpdateCompaniesDto) {
        await this.getCompany(id)

        const [affected] = await this.CompaniesDB.update({ ...updateDto }, { where: { companyId: id } })

        if (!affected) throw new UnprocessableEntityException('Data tidak bisa diproses');
        return 'success'
    }

    async remove(id: number) {
        const company = await this.getCompany(id)
        await company.destroy()

        return 'success'
    }

    async getPrivateNodes(id: number, pagination: PaginationQueryDto) {
        const company = await this.getCompany(id)
        const { paginationObj, searchObj, getMetaData } = pagination

        const [count, rows] = await Promise.all([
            company.countPrivateNodes({ where: { ...searchObj } }),
            company.getPrivateNodes({
                where: { ...searchObj },
                attributes: [
                    'nodeId', 'name', 'coordinate', 'isUptodate', 'lastDataSent', 'createdAt',
                ],
                ...paginationObj,
                order: [['createdAt', 'DESC']],
            })
        ])

        return {
            rows,
            meta: getMetaData(pagination, count)
        };
    }

    private async getCompany(id: number, opt?: FindOptions<InferAttributes<Companies, { omit: never }>>) {
        const company = await this.CompaniesDB.findOne({
            where: { companyId: id },
            attributes: ['name', 'userId', 'phone', 'profilePicture', 'email'],
            ...opt
        })

        if (!company) throw new NotFoundException()
        return company
    }


}
