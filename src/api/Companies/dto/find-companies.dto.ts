import { Transform } from 'class-transformer';
import {
    IsBoolean,
    IsEmail,
    IsIn,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

export class FindCompaniesDto {
    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true')
    all?: boolean;

    @IsString()
    @IsOptional()
    @IsIn(['simple', 'all'])
    view: 'simple' | 'all' = 'all';
}
