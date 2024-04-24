import DataLogs from '../models/datalogs.js';

const tempConversionTable = [
    {
        limit: 37,
        category: 'Aman',
    },
    {
        limit: Infinity,
        category: 'Bahaya',
    },
];

const humConversionTable = [
    {
        limit: 60,
        category: 'Bersih',
    },
    {
        limit: Infinity,
        category: 'Bahaya',
    },
];

export function calculateTemp(value: number) {
    const { category } = tempConversionTable.find((e) => e.limit >= value);
    return { value, category };
}

export function calculateHum(value: number) {
    const { category } = humConversionTable.find((e) => e.limit >= value);
    return { value, category };
}

export function calculateTempHum(dataLog: DataLogs) {
    const { category: tempCategory } = tempConversionTable.find(
        (e) => e.limit >= dataLog.temperature
    );
    const { category: HumCategory } = humConversionTable.find((e) => e.limit >= dataLog.humidity);

    return {
        temperature: {
            value: dataLog.temperature,
            category: tempCategory,
        },
        humidity: {
            value: dataLog.humidity,
            category: HumCategory,
        },
    };
}
