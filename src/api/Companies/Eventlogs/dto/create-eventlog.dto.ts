import { IsBoolean, IsDateString, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator"

export class CreateEventDto {
    @IsString()
    @MaxLength(30)
    @IsNotEmpty()
    name?: string

    @IsString()
    @MaxLength(300)
    @IsNotEmpty()
    description?: string

    @IsDateString()
    startDate?: Date

    @IsDateString()
    @IsOptional()
    endDate?: Date

    @IsOptional()
    @IsString()
    location?: string

    @IsString()
    @IsIn(['production', 'maintenance', 'training', 'administrative', 'repair', 'other'])
    type?: 'production' | 'maintenance' | 'training' | 'administrative' | 'repair' | 'other';

    @IsBoolean()
    isCompleted?: boolean

}
