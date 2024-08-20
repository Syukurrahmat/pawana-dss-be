import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class FindUserDto {
    @IsIn(['admin', 'gov', 'regular', 'manager'])
    @IsOptional()
    role?: string;

    @IsBoolean()
    @IsOptional()
    unverified?: boolean;

    @IsString()
    @IsOptional()
    @IsIn(['simple', 'all'])
    view: 'simple' | 'all' = 'all';
}
