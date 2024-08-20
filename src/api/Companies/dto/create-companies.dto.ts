import { IsIn, IsInt, IsNumber, IsString, MaxLength } from 'class-validator';
import {} from 'sequelize-typescript';

export class CreateCompaniesDto {
    @IsString()
    @MaxLength(30)
    name?: string;

    @IsString()
    @MaxLength(300)
    description?: string;

    @IsString()
    @MaxLength(300)
    address?: string;

    @IsString()
    @IsIn(['tofufactory', 'service', 'agriculture', 'retailstore', 'restaurant ', 'other'])
    type?: string;

    @IsInt()
    managerId?: number;

    @IsNumber({}, { each: true })
    coordinate?: number[];
}
