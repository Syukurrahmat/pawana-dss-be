import DataLogs from '../models/datalogs.js';
import { GRKCategorize } from '../types/dashboardData.js';

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



export function GRKtoCategorize(value: number, gas: 'CH4' | 'CO2'): GRKCategorize {
    const tableConvertion = gas == 'CH4' ? CH4ConversionTable : gas == 'CO2' ? CO2ConversionTable : null
    if (!tableConvertion) throw Error

    const { category } = tableConvertion.find((e) => e.limit >= value);
    return { gas, value, category };
}
