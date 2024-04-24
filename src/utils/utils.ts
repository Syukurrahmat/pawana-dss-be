import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import moment from 'moment';

console.log(process.env.DATABASE_NAME);

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
