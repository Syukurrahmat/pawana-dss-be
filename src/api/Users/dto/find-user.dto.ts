import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator"

export class FindUserDto {
    @IsIn(['admin', 'gov', 'regular', 'manager'])
    @IsOptional()
    role?: string

    @IsBoolean()
    @IsOptional()
    unverified? : boolean
}
