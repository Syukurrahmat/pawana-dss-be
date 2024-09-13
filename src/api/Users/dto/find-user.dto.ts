import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class FindUserDto {
    @IsIn(['admin', 'gov', 'regular', 'manager'])
    @IsOptional()
    role?: string;

    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true')
    unverified?: boolean;

    @IsString()
    @IsOptional()
    @IsIn(['simple', 'all'])
    view: 'simple' | 'all' = 'all';
}
