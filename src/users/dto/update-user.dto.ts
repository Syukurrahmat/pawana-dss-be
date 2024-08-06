import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto.js';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['role', 'email'])) {
    @IsOptional()
    @IsString()
    password ?:string

    @IsOptional()
    @IsString()
    newPassword ?:string
}
