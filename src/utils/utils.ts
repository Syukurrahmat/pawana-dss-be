import { Request, Response, NextFunction } from 'express';
import { Op, OrderItem } from 'sequelize';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import moment from 'moment';
import bcrypt from 'bcryptjs';

export const __dirname = dirname(fileURLToPath(import.meta.url));
export function printJSON(data: any) {
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync('print.json', jsonData);
}

export function arrayOfHours() {
    return Array.from({ length: 24 }, (_, i) =>
        moment().startOf('hour').subtract(i, 'hours').toDate()
    );
}

export function average(arr: number[]) {
    return arr.reduce((acc, curr) => acc + curr, 0) / arr.length;
}

type sortFunc = (
    a: { datetime: Date; [key: string]: any },
    b: { datetime: Date; [key: string]: any }
) => number;

export const sortBytime: sortFunc = (a, b) => b.datetime.getTime() - a.datetime.getTime();

export const salt = bcrypt.genSaltSync(10);

interface IbuildQueryOptions {
    searchField: string;
    sortOpt: string[];
}

const PSSMiddleware = (availableSortOpt: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        let page = parseInt(req.query.page as string) || 1;
        let limit = parseInt(req.query.limit as string) || 10;

        if (page < 1) page = 1;
        if (limit < 1 || limit > 100) limit = 10;

        // Search
        const searchQuery = req.query.q as string;
        const searchObj = searchQuery ? { name: { [Op.like]: `%${searchQuery}%` } } : {};

        // Ordering
        const sort = req.query.sort as string;
        const order = req.query.order as string;

        const orderItem: OrderItem = [
            sort && availableSortOpt.includes(sort) ? sort : availableSortOpt[0],
            order && order.toUpperCase() == 'DESC' ? 'DESC' : 'ASC',
        ];

        return {
            page,
            limit,
            search: searchObj,
            order: orderItem,
        };
    };
};

export const paginationMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
    { sortOpt }: IbuildQueryOptions
) => {
    // Pagination
    let page = parseInt(req.query.page as string) || 1;
    let limit = parseInt(req.query.limit as string) || 10;

    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) limit = 10;

    // Search
    const searchQuery = req.query.search as string;
    const searchObj = searchQuery ? { name: { [Op.like]: `%${searchQuery}%` } } : {};

    // Ordering
    const sort = req.query.sort as string;
    const order = req.query.order as string;

    const orderItem: OrderItem = [
        sort && sortOpt.includes(sort) ? sort : sortOpt[0],
        order && order.toUpperCase() == 'DESC' ? 'DESC' : 'ASC',
    ];

    return {
        page,
        limit,
        search: searchObj,
        order: orderItem,
    };
};

export const buildQuery = (req: Request, { searchField, sortOpt }: IbuildQueryOptions) => {
    // Pagination
    let page = parseInt(req.query.page as string) || 1;
    let limit = parseInt(req.query.limit as string) || 10;

    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) limit = 10;

    // Search
    const searchQuery = req.query.q as string;
    const searchObj = searchQuery ? { [searchField]: { [Op.like]: `%${searchQuery}%` } } : {};

    // Ordering
    const sort = req.query.sort as string;
    const order = req.query.order as string;

    const orderItem: OrderItem = [
        sort && sortOpt.includes(sort) ? sort : sortOpt[0],
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
