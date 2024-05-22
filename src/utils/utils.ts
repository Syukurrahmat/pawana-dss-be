import { Request, Response, NextFunction } from 'express';
import { Op, OrderItem } from 'sequelize';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import moment, { Moment } from 'moment';
import bcrypt from 'bcryptjs';
import db from '../models/index.js';

export const __dirname = dirname(fileURLToPath(import.meta.url));
export function printJSON(data: any) {
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync('print.json', jsonData);
}

export function arrayOfHours(startHour: Moment = moment()) {
    return Array.from({ length: 24 }, (_, i) =>
        startHour.clone().subtract(i, 'hours').toDate()
    );
}

export function average(arr: number[]) {
    return arr.reduce((acc, curr) => acc + curr, 0) / arr.length;
}

type sortFunc = (
    a: { datetime: Date;[key: string]: any },
    b: { datetime: Date;[key: string]: any }
) => number;

export const sortBytime: sortFunc = (a, b) => b.datetime.getTime() - a.datetime.getTime();

export const myBcriptSalt = bcrypt.genSaltSync(10);

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

    console.log(sort)

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


export const getTimeZoneOffsetString = (offset: string, defaultValue: string = '+07:00') => {

    const offsetMinutes = parseInt(offset)

    if (isNaN(offsetMinutes)) return { offsetUTC: -420, timeZone: defaultValue };

    const sign = offsetMinutes > 0 ? "-" : "+";
    const absOffsetHours = Math.abs(Math.floor(offsetMinutes / 60));

    const hoursString = absOffsetHours.toString().padStart(2, "0");
    const minutesString = (Math.abs(offsetMinutes) % 60).toString().padStart(2, "0");

    return { offsetUTC: offsetMinutes, timeZone: sign + hoursString + ":" + minutesString }
}





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

        console.log('lahhhh')
        this.setDataValue('coordinate', value);
    }
}
