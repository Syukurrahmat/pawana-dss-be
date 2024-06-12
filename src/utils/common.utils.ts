import { Request } from 'express';
import { Op, OrderItem } from 'sequelize';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import moment, { Moment } from 'moment';
import bcrypt from 'bcryptjs';
import db from '../models/index.js';
import DataLogs from '../models/datalogs.js';

export const __dirname = dirname(fileURLToPath(import.meta.url));

export const printJSON = (data: any) => fs.writeFileSync('print.json', JSON.stringify(data, null, 2));

export const arrayOfHours = (startHour: Moment = moment(), length: number = 24) => (
    Array.from({ length }, (_, i) =>
        startHour.clone().subtract(i, 'hours').toDate()
    )
)


export const average = (arr: number[]) => arr.reduce((acc, curr) => acc + curr, 0) / arr.length;

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
        this.setDataValue('coordinate', value);
    }
}



export function linearImputationData(data: number[]) {
    for (let i = 0; i < data.length; i++) {
        if (isNaN(data[i])) {
            let prevValue: number;
            let nextValue: number;

            let j = i + 1;
            // Cari nilai sebelum dan sesudah nilai yang hilang
            while (isNaN(data[j]) && j < data.length) {
                j++;
            }
            if (!isNaN(data[j])) {
                prevValue = data[i - 1];
                nextValue = data[j];
                // Hitung nilai interpolasi linear
                data[i] = prevValue + (nextValue - prevValue) / (j - i) * (i - (i - 1));
            }
        }
    }
    return data;
}


export const calculateMissingData = (data: number[]) => data.filter(value => isNaN(value)).length / data.length


// export function groupByInterval(data: { datetime: Date, value: number }[], interval: moment.unitOfTime.StartOf) {

//     let dataWithMoment = data.map(e => ({
//         datetime: moment(e.datetime),
//         value: e.value
//     }))

//     const groupedData = dataWithMoment.reduce((acc, { datetime, value }) => {
//         const intervalStart = datetime.startOf(interval).valueOf();
//         acc[intervalStart] = acc[intervalStart] || { datetime: intervalStart, value: 0, count: 0 };
//         acc[intervalStart].value += value;
//         acc[intervalStart].count++;
//         return acc;
//     }, {});

//     const resultArray = Object.values(groupedData);
//     const averagedData = resultArray.map(({ datetime, value, count }) => ({ datetime: new Date(datetime), value: value / count }));
//     return averagedData;
// }


export function groupByInterval(data: DataLogs[], interval: moment.unitOfTime.StartOf){
    const groupedData = data.reduce((acc, { datetime, pm25, pm100, ch4, co2 }) => {
        
        const intervalStart = moment(datetime).startOf(interval).valueOf();
        
        acc[intervalStart] = acc[intervalStart] || { datetime: intervalStart, pm25: 0, pm100: 0, ch4: 0, co2: 0, count: 0 };
        acc[intervalStart].pm25 += pm25 || 0;
        acc[intervalStart].pm100 += pm100 || 0;
        acc[intervalStart].ch4 += ch4 || 0;
        acc[intervalStart].co2 += co2 || 0;
        acc[intervalStart].count++;
        
        return acc;
    }, {});

    const resultArray = Object.values(groupedData);
    const averagedData = resultArray.map(({ datetime, pm25, pm100, ch4, co2, count }) => ({
        datetime : new Date(datetime),
        pm25: pm25 / count,
        pm100: pm100 / count,
        ch4: ch4 / count,
        co2: co2 / count,
    }));
    return averagedData;
}
