import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseIntPipeOptional implements PipeTransform {
    transform(value: any): number | undefined {
        console.log('===============',{value})
        if (value === null || value === undefined || value === '' || isNaN(value)) {
            return undefined
        }

        const parsed = parseInt(value, 10);
        if (isNaN(parsed)) {
            throw new BadRequestException('Validation failed. Value is not an integer.');
        }
        return parsed;
    }
}
