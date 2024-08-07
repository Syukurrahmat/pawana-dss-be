import { GRKCategorize, ISPUValue } from '../../types/dashboardData.js';
import { CH4ConversionTable, CO2ConversionTable, ISPUConvertionTable } from './conversionTable.js';

const errorReturn = { category: undefined, recomendation: undefined }

export function evaluateCH4(value: number, withRecomendation: boolean = false): GRKCategorize {
    const { category, recomendation } = CH4ConversionTable.find((e) => e.limit >= value) || errorReturn
    return {
        value,
        category,
        recomendation: withRecomendation ? recomendation : undefined
    };
}

export function evaluateCO2(value: number, withRecomendation: boolean = false): GRKCategorize {
    const { category, recomendation } = CO2ConversionTable.find((e) => e.limit >= value) || errorReturn
    return {
        value,
        category,
        recomendation: withRecomendation ? recomendation : undefined
    };
}

export function evaluateISPU(pm25Value: number, pm100Value: number, withRecomendation: boolean = false): [ISPUValue, ISPUValue] {

    const getIspuValue = (value: number, pollutant: string) => {
        if (value < 0) throw new Error('Input value must be a non-negative number.');
        if (value == 0) return [0, 0];

        const ISPUTreshold = [0, ...ISPUConvertionTable.map((e) => e.ISPU)];
        const convertion = [0, ...ISPUConvertionTable.map((e) => e[pollutant])];
        const index = convertion.findIndex((e: number) => e >= value);

        if (index == -1) return [305, 305]

        const [Ib, Ia] = ISPUTreshold.slice(index - 1, index + 1) as [number, number]
        const [Xb, Xa] = convertion.slice(index - 1, index + 1) as [number, number]

        const I = ((Ia - Ib) / (Xa - Xb)) * (value - Xb) + Ib;

        return [Math.round(I), I]
    };

    const calculateForPolutant = (value: number, pollutant: "PM25" | "PM100"): ISPUValue => {
        const [ispuValue, floatISPUValue] = getIspuValue(value, pollutant);
        const { category, recomendation } = value ? ISPUConvertionTable.find((e) => e.ISPU >= ispuValue) || errorReturn : errorReturn

        return {
            pollutant,
            ispu: ispuValue,
            ispuFloat: toFixedNumber(floatISPUValue),
            pollutantValue: toFixedNumber(value),
            category,
            recomendation: withRecomendation ? recomendation : undefined
        }
    }

    return [
        { value: pm25Value, pollutant: 'PM25' },
        { value: pm100Value, pollutant: 'PM100' }
    ]
        .map((e) => calculateForPolutant(e.value, e.pollutant as any))
        .sort((a, b) => b.ispuFloat - a.ispuFloat) as [ISPUValue, ISPUValue]

}

function toFixedNumber(value: number, decimals = 3) {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
}