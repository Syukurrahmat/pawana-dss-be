import { IsEmail, isIn, IsIn, IsInt, IsOptional, IsString, MaxLength, MinLength } from "class-validator"

export class CreateCompaniesDto {
    @IsString()
    @MaxLength(30)
    name?: string

    @IsString()
    @MaxLength(300)
    description?: string

    @IsString()
    @MaxLength(300)
    address?: string

    @IsString()
    @IsIn(['tofufactory', 'service', 'agriculture', 'retailstore', 'restaurant ', 'other'])
    type?: string

    @IsInt()
    managerId?: number

    @IsInt({ each: true })
    coordinate?: number[]
}
