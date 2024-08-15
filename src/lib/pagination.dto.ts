// page,
// limit,
// offset: (page - 1) * limit,
// search: searchObj,
// order: [orderItem],

import { Prisma } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, isInt, IsInt, IsOptional, IsString, Max, Min, min } from 'class-validator';
import { Op, OrderItem, Sequelize } from 'sequelize';

enum Orderby {
    desc = 'desc',
    asc = 'asc',
    DESC = 'DESC',
    ASC = 'ASC',
}

export class PaginationQueryDto {
    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    page: number = 1

    @IsOptional()
    @IsInt()
    @Min(10)
    @Max(100)
    @Type(() => Number)
    limit: number = 10


    @IsOptional()
    @IsString()
    sort?: string;


    @IsOptional()
    @IsEnum(Orderby)
    order: 'desc' | 'asc' | 'DESC' | "ASC" = 'asc'


    @IsOptional()
    @IsString()
    search?: string;

    get searchObj(): Record<any, any> {
        return this.search ? { name: { [Op.like]: `%${this.search}%` } } : {}
    }

    get skip() {
        return (this.page - 1) * this.limit;
    }

    get paginationObj() {
        const orderItem: OrderItem[] = this.sort ? [
            Sequelize.col(this.sort),
            this.order
        ] : [];

        return {
            page: this.page,
            limit: this.limit,
            offset: (this.page - 1) * this.limit,
            order: orderItem,
        };

    }

    getMetaData(pagination: PaginationQueryDto, total: number) {
        const { limit, page, search, } = pagination

        const totalPage = Math.ceil(total / limit)

        return {
            total,
            totalPage,
            page: page,
            search: search,
            limit: limit,
            prev: page > 1 ? page - 1 : null,
            next: page < totalPage ? page + 1 : null,
        }
    }
}
