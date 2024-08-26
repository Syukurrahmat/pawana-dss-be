import fs from 'fs';
import moment, { Moment } from 'moment';
import { join } from 'path';
import { PUBLIC_DIR } from '../constants/server';

export const printJSON = (data: any) =>
    fs.writeFileSync('print.json', JSON.stringify(data, null, 2));

export const arrayOfObjectHours = <T = any>(startHour: Moment = moment(), length: number = 24) =>
    Array.from({ length }, (_, i) => ({
        datetime: startHour.clone().subtract(i, 'hours'),
        value: [] as T[],
    }));

export const average = (arr: number[]) => arr.reduce((acc, curr) => acc + curr, 0) / arr.length;

 
export const toFixedNumber = (value: number, decimals = 3) => {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
};

export const coordinateGetterSetter: any = {
    get() {
        const coordinate = this.getDataValue('coordinate');
        if (coordinate) {
            const [lng, lat] = coordinate.coordinates;
            return [lat, lng];
        }
    },
    set(value: any) {
        if (Array.isArray(value) && value.length == 2) {
            return this.setDataValue('coordinate', {
                type: 'Point',
                coordinates: [value[1], value[0]],
            });
        }
        this.setDataValue('coordinate', value);
    },
};

export function sortByDatetime<T extends { datetime: Date | Moment }>(a: T, b: T): number {
    return moment(b.datetime).valueOf() - moment(a.datetime).valueOf();
}

export const publicDir = (...args: string[]) => join(__dirname, '..', '..', PUBLIC_DIR, ...args);
