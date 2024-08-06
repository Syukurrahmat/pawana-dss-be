import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator"

export class CreateUserDto {
    @IsString()
    @MaxLength(30)
    @MinLength(3)
    name?: string

    @IsEmail()
    email?: string

    @IsString()
    phone?: string

    @IsString()
    @IsOptional()
    @MaxLength(300)
    description?: string
    
    @IsString()
    @MaxLength(300)
    address?: string
    
    @IsString()
    @IsOptional()
    profilePicture?: string

    
    @IsString()
    @IsIn(['admin', 'gov', 'regular', 'manager'])
    role?: string
}
