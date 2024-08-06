import bcrypt from 'bcryptjs';
import { Request } from 'express';
import fs from 'fs';
import moment, { Moment } from 'moment';
import { Op, OrderItem } from 'sequelize';
import db from '../models/index.js';

export const myBcriptSalt = bcrypt.genSaltSync(10);

export const printJSON = (data: any) => fs.writeFileSync('print.json', JSON.stringify(data, null, 2));

export const arrayOfObjectHours = <T = any>(startHour: Moment = moment(), length: number = 24) => (
    Array.from({ length }, (_, i) => ({
        datetime: startHour.clone().subtract(i, 'hours'),
        value: [] as T[]
    }))
)

export const average = (arr: number[]) => arr.reduce((acc, curr) => acc + curr, 0) / arr.length;


interface IbuildQueryOptions {
    sortOpt?: string[];
}

export const parseQueries = (req: Request, opt: IbuildQueryOptions = {}) => {
    const sortOpt = opt.sortOpt || []

    // Pagination
    let page = parseInt(req.query.page as string) || 1;
    let limit = parseInt(req.query.limit as string) || 10;

    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) limit = 10;

    // Search
    const searchQuery = req.query.q as string;
    const searchObj = searchQuery ? { name: { [Op.like]: `%${searchQuery}%` } } : {};

    // Ordering
    const sort = req.query.sort as string
    const order = req.query.order as string;

    const orderItem: OrderItem = [
        sort && sortOpt.includes(sort) ? db.sequelize.col(sort) : db.sequelize.col(sortOpt[0]),
        order && order.toUpperCase() == 'DESC' ? 'DESC' : 'ASC',
    ];

    return {
        page,
        limit,
        offset: (page - 1) * limit,
        search: searchObj,
        order: [orderItem],
    };
};

export const coordinateGetterSetter = {
    get() {
        const coordinate = this.getDataValue('coordinate');
        if (coordinate) {
            const [lng, lat] = coordinate.coordinates
            return [lat, lng]
        }
    },
    set(value: any) {
        if (Array.isArray(value) && value.length == 2) {
            return this.setDataValue('coordinate', {
                type: 'Point', coordinates: [value[1], value[0]]
            });
        }
        this.setDataValue('coordinate', value);
    }
};
export function sortByDatetime<T extends { datetime: Date | Moment }>(a: T, b: T): number {
    return moment(b.datetime).valueOf() - moment(a.datetime).valueOf();
}