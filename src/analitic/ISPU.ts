import moment from 'moment';
import DataLogs from '../models/datalogs.js';
import { average } from '../utils/utils.js';

export const ISPUConvertionTable = [
    {
        ISPU: 50,
        category: 'Baik',
        color: 'Hijau',
        PM100: 50,
        PM25: 15.5,
    },
    {
        ISPU: 100,
        category: 'Sedang',
        color: 'Biru',
        PM100: 150,
        PM25: 55.4,
    },
    {
        ISPU: 200,
        category: 'Tidak Sehat',
        color: 'Kuning',
        PM100: 350,
        PM25: 150.4,
    },
    {
        ISPU: 300,
        category: 'Sangat Tidak Sehat ',
        color: 'Merah',
        PM100: 420,
        PM25: 250.4,
    },
    {
        ISPU: Infinity,
        category: 'Berbahaya',
        color: 'Hitam',
    },
];

export function calculateISPU(dataLogs: DataLogs[], hour: Date) {
    const oneDayAgo = moment(hour).subtract(1, 'days').toDate();
    const filteredData = dataLogs.filter((e) => e.datetime > oneDayAgo && e.datetime <= hour);

    const PM25Average = average(filteredData.map((e) => e.pm25));
    const PM100Average = average(filteredData.map((e) => e.pm100));

    return {
        datetime: hour,
        pm25: {
            ...toIspuValue(PM25Average, 'PM25'),
        },
        pm100: {
            ...toIspuValue(PM100Average, 'PM100'),
        },
    };
}

function toIspuValue(Xx: number, pollutant: 'PM100' | 'PM25') {
    const getIspuValue = () => {
        if (Xx < 0) throw new Error('Input value must be a non-negative number.');
        if (Xx == 0) return [0, 0];

        const ISPUTreshold = [0, ...ISPUConvertionTable.map((e) => e.ISPU)];
        const convertion = [0, ...ISPUConvertionTable.map((e) => e[pollutant])];
        const index = convertion.findIndex((e) => e >= Xx);

        if (index == -1) return [Infinity, Infinity];

        const [Ib, Ia] = ISPUTreshold.slice(index - 1, index + 1);
        const [Xb, Xa] = convertion.slice(index - 1, index + 1);

        const I = ((Ia - Ib) / (Xa - Xb)) * (Xx - Xb) + Ib;
        return [Math.round(I), I];
    };

    const [ispuValue, floatISPUValue] = getIspuValue();
    const { category, color } = ISPUConvertionTable.find((e) => e.ISPU >= ispuValue);

    return {
        ispu: ispuValue,
        ispuFloat: floatISPUValue,
        value: Xx,
        category,
        color,
    };
}
