import { IsDate, IsDateString, IsIn, IsInt, IsOptional } from "class-validator"

export class FindReportDto {
    @IsDateString()
    @IsOptional()
    date?: Date

    @IsInt()
    @IsOptional()
    nearCompany?: number

    @IsInt()
    @IsIn([250, 500, 1000, 2000])
    @IsOptional()
    distance?: 500;
}
