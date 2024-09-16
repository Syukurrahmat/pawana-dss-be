import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsNumber, IsNumberString, IsOptional } from 'class-validator';

export class FindReportDto {
    @IsDateString()
    @IsOptional()
    date?: Date;

    @IsNumber()
    @IsOptional()
    @Type(() => Number) 
    nearCompany?: number;

    @IsNumber()
    @Type(() => Number) 
    @IsIn([250, 500, 1000, 2000])
    @IsOptional()
    distance?: 500;
}
