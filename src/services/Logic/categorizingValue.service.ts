import { Injectable } from '@nestjs/common';
import { toFixedNumber } from '../../lib/common.utils.js';
import { GRKValue, ISPUValue, ISPUValueItem } from '../../types/dashboardData.js';
import { CH4ConversionTable, CO2ConversionTable, ISPUConvertionTable } from './conversionTable.js';

@Injectable()
export class CategorizeValueService {
    CH4(value: number, recomendation?: boolean): GRKValue {
        const convertion = CH4ConversionTable.find((e) => e.limit >= value);
        return {
            value,
            category: convertion?.category,
            recomendation: convertion && recomendation ? convertion.recomendation : undefined,
        };
    }

    CO2(value: number, recomendation?: boolean): GRKValue {
        const convertion = CO2ConversionTable.find((e) => e.limit >= value);
        return {
            value,
            category: convertion?.category,
            recomendation: convertion && recomendation ? convertion.recomendation : undefined,
        };
    }

    ISPU(pm25Value: number, pm100Value: number, recomendation?: boolean): ISPUValue {
        const getIspuValue = (value: number, pollutant: string) => {
            if (value < 0) throw new Error('Input value must be a non-negative number.');
            if (value == 0) return [0, 0];

            const ISPUTreshold = [0, ...ISPUConvertionTable.map((e) => e.ISPU)];
            const convertion = [0, ...ISPUConvertionTable.map((e) => e[pollutant])];
            const index = convertion.findIndex((e: number) => e >= value);

            if (index == -1) return [305, 305];

            const [Ib, Ia] = ISPUTreshold.slice(index - 1, index + 1) as [number, number];
            const [Xb, Xa] = convertion.slice(index - 1, index + 1) as [number, number];

            const I = ((Ia - Ib) / (Xa - Xb)) * (value - Xb) + Ib;

            return [Math.round(I), I];
        };

        const calculateForPolutant = (
            value: number,
            pollutant: 'PM25' | 'PM100'
        ): ISPUValueItem => {
            const [ispuValue, floatISPUValue] = getIspuValue(value, pollutant);
            const convertion = value
                ? ISPUConvertionTable.find((e) => e.ISPU >= ispuValue)
                : undefined;

            return {
                pollutant,
                ispu: ispuValue,
                ispuFloat: toFixedNumber(floatISPUValue),
                pollutantValue: toFixedNumber(value),
                category: convertion?.category,
                recomendation: convertion && recomendation ? convertion.recomendation : undefined,
            };
        };

        return [
            { value: pm25Value, pollutant: 'PM25' },
            { value: pm100Value, pollutant: 'PM100' },
        ]
            .map((e) => calculateForPolutant(e.value, e.pollutant as any))
            .sort((a, b) => b.ispuFloat - a.ispuFloat) as [ISPUValueItem, ISPUValueItem];
    }
}
