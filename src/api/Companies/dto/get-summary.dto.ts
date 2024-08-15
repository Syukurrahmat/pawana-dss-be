import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, Validate } from 'class-validator';
import moment from 'moment';
import { IsDateString, IsIn, IsOptional, IsString } from "class-validator"

export class SummaryDto {
    @IsString()
    @IsOptional()
    @IsIn(['week', 'month'])
    type: 'week' | 'month' = 'month'


    @IsString()
    @IsOptional()
    periode?: string;
}
