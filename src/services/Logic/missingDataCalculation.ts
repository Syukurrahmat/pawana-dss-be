import { MISSING_DATA_TRESHOLD } from '../../constants/server.js';


export const fillMissingData = (data: number[], length?: number) => {
    if (calculateMissingData(data, length) > MISSING_DATA_TRESHOLD) return null;
    return linearImputationData(data).filter(e => e);
};

export function linearImputationData(data: number[]) {
    for (let i = 0; i < data.length; i++) {
        if (isNaN(data[i])) {
            let prevValue: number;
            let nextValue: number;

            let j = i + 1;
            while (isNaN(data[j]) && j < data.length) {
                j++;
            }
            if (!isNaN(data[j])) {
                prevValue = data[i - 1];
                nextValue = data[j];
                data[i] = prevValue + (nextValue - prevValue) / (j - i) * (i - (i - 1));
            }
        }
    }
    return data;
}


export const calculateMissingData = (data: number[], length?: number) => data.filter(value => isNaN(value)).length / (length || data.length);

interface SimpleDatalogs {
    datetime: Date; // or Date, depending on your use case
    pm25: number;
    pm100: number;
    ch4: number;
    co2: number;
}

export const DatalogsLinearImputation = <T extends SimpleDatalogs>(data: T[]): T[] => {
    const interpolatedData = [...data];

    const interpolate = (prev: T, next: T, index: number, prop: string) => {
        const prevDate = new Date(prev.datetime).getTime();
        const nextDate = new Date(next.datetime).getTime();
        const currDate = new Date(interpolatedData[index].datetime).getTime();

        const ratio = (currDate - prevDate) / (nextDate - prevDate);
        interpolatedData[index][prop] = (prev[prop] as number) + ratio * ((next[prop] as number) - (prev[prop] as number));
    };

    for (let i = 0; i < interpolatedData.length; i++) {
        if (isNaN(interpolatedData[i].pm25) || isNaN(interpolatedData[i].pm100) || isNaN(interpolatedData[i].ch4) || isNaN(interpolatedData[i].co2)) {
            let prev: T | null = null;
            let next: T | null = null;

            // Find previous known value
            for (let j = i - 1; j >= 0; j--) {
                if (!isNaN(interpolatedData[j].pm25) && !isNaN(interpolatedData[j].pm100) && !isNaN(interpolatedData[j].ch4) && !isNaN(interpolatedData[j].co2)) {
                    prev = interpolatedData[j];
                    break;
                }
            }

            // Find next known value
            for (let j = i + 1; j < interpolatedData.length; j++) {
                if (!isNaN(interpolatedData[j].pm25) && !isNaN(interpolatedData[j].pm100) && !isNaN(interpolatedData[j].ch4) && !isNaN(interpolatedData[j].co2)) {
                    next = interpolatedData[j];
                    break;
                }
            }

            // If both previous and next known values exist, interpolate
            if (prev && next) {
                ['pm25', 'pm100', 'ch4', 'co2'].forEach((prop: string) => {
                    if (isNaN(interpolatedData[i][prop] as number)) {
                        interpolate(prev, next, i, prop);
                    }
                });
            }
        }
    }

    return interpolatedData;
};
