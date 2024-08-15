import { IsDateString, IsInt, IsNumber, IsOptional, IsString, MaxLength } from "class-validator"


export class CreateNodeDto {
    @IsString()
    @MaxLength(30)
    name?: string

    @IsString()
    @MaxLength(300)
    description?: string

    @IsString()
    @MaxLength(300)
    @IsOptional()
    address?: string

    @IsNumber({}, { each: true })
    @IsOptional()
    coordinate?: number[]

    @IsDateString()
    @IsOptional()
    instalationDate?: Date

    @IsInt()
    @IsOptional()
    companyId?: number
}
