import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Op, Order, OrderItem, Sequelize } from 'sequelize';

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
    page: number = 1;

    @IsOptional()
    @IsInt()
    @Min(10)
    @Max(100)
    @Type(() => Number)
    limit: number = 10;

    @IsOptional()
    @IsString()
    sort?: string;

    @IsOptional()
    @IsEnum(Orderby)
    order: 'desc' | 'asc' | 'DESC' | 'ASC' = 'asc';

    @IsOptional()
    @IsString()
    search?: string;

    get searchObj(): Record<any, any> {
        return this.search ? { name: { [Op.like]: `%${this.search}%` } } : {};
    }

    get skip() {
        return (this.page - 1) * this.limit;
    }

    get paginationObj() {
        return {
            page: this.page,
            limit: this.limit,
            offset: (this.page - 1) * this.limit,
            order: this.sort ? [[this.sort, String(this.order)]] as Order : undefined,
        };
    }

    getMetaData(pagination: PaginationQueryDto, total: number) {
        const { limit, page, search } = pagination;

        const totalPage = Math.ceil(total / limit);

        return {
            total,
            totalPage,
            page: page,
            search: search,
            limit: limit,
            prev: page > 1 ? page - 1 : null,
            next: page < totalPage ? page + 1 : null,
        };
    }
}
