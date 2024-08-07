import { IsDateString, IsIn, IsString } from "class-validator"

export class SummaryDto {
    @IsString()
    @IsIn(['week', 'month'])
    type?: 'week' | 'month'


    @IsString()
    @IsDateString()
    periode?: string
}