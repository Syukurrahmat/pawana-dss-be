import { CH4ConversionTable, CO2ConversionTable, ISPUConvertionTable } from '../../constants/conversionTable.js';
import { GRKCategorize, ISPUValue } from '../../types/dashboardData.js';

const errorReturn = {category : undefined, recomendation : undefined}

export function evaluateCH4(value: number, withRecomendation: boolean = false): GRKCategorize {
    const { category, recomendation } = CH4ConversionTable.find((e) => e.limit >= value) || errorReturn
    return {
        gas: 'CH4',
        value,
        category,
        recomendation: withRecomendation ? recomendation : undefined
    };
}

export function evaluateCO2(value: number, withRecomendation: boolean = false): GRKCategorize {
    const { category, recomendation } = CO2ConversionTable.find((e) => e.limit >= value) ||  errorReturn
    return {
        gas: 'CO2',
        value,
        category,
        recomendation: withRecomendation ? recomendation : undefined
    };
}

export function evaluateISPU(value: number, pollutant: 'PM100' | 'PM25', withRecomendation: boolean = false): ISPUValue {
    const getIspuValue = () => {
        if (value < 0) throw new Error('Input value must be a non-negative number.');
        if (value == 0) return [0, 0];

        const ISPUTreshold = [0, ...ISPUConvertionTable.map((e) => e.ISPU)];
        const convertion = [0, ...ISPUConvertionTable.map((e) => e[pollutant])];
        const index = convertion.findIndex((e) => e >= value);

        if (index == -1) return [Infinity, Infinity];

        const [Ib, Ia] = ISPUTreshold.slice(index - 1, index + 1);
        const [Xb, Xa] = convertion.slice(index - 1, index + 1);

        const I = ((Ia - Ib) / (Xa - Xb)) * (value - Xb) + Ib;
        return [Math.round(I), I];
    };

    const [ispuValue, floatISPUValue] = getIspuValue();
    const { category, recomendation } = value ? ISPUConvertionTable.find((e) => e.ISPU >= ispuValue) ||  errorReturn : errorReturn

    return {
        pollutant,
        ispu: ispuValue,
        ispuFloat: floatISPUValue,
        pollutantValue: value,
        category,
        recomendation: withRecomendation ? recomendation : undefined
    };
}
