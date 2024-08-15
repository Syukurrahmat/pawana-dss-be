import { Transform } from "class-transformer"
import { IsBoolean, IsDateString, IsIn, IsOptional, IsString } from "class-validator"

export class FindNodesDto {
    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true')
    all?: boolean


    @IsString()
    @IsOptional()
    @IsIn(['private', 'public'])
    ownship?: string

    @IsString()
    @IsOptional()
    @IsIn(['simple', 'all'])
    view: 'simple' | 'all' = 'all'
}

export class FindDatalogsDto {
    @IsDateString()
    startDate?: Date
  
    @IsDateString()
    endDate?: Date
}

