import DataLogs from '../models/datalogs.js';

const CO2ConversionTable = [
    {
        limit: 350,
        category: 'Bersih',
    },
    {
        limit: 700,
        category: 'Tercemar',
    },
    {
        limit: Infinity,
        category: 'Bahaya',
    },
];

const CH4ConversionTable = [
    {
        limit: 1000,
        category: 'Bersih',
    },
    {
        limit: 2000,
        category: 'Tercemar',
    },
    {
        limit: Infinity,
        category: 'Bahaya',
    },
];

type calculateGRKProp = DataLogs | { ch4: number; co2: number; [key: string]: any };

export function calculateCH4(value: number) {
    const { category } = CH4ConversionTable.find((e) => e.limit >= value);
    return { value, category };
}

export function calculateCO2(value: number) {
    const { category } = CO2ConversionTable.find((e) => e.limit >= value);
    return { value, category };
}
