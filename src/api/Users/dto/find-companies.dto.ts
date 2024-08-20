import { IsIn, IsOptional, IsString } from 'class-validator';

export class FindCompaniesDto {
    @IsString()
    @IsOptional()
    @IsIn(['simple', 'all'])
    view: 'simple' | 'all' = 'all';
}
