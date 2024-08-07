import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator"

export class FindCompaniesDto {
    @IsBoolean()
    @IsOptional()
    all?: boolean

    @IsString()
    @IsOptional()
    @IsIn(['simple', 'all'])
    view: 'simple' | 'all' = 'all'
}