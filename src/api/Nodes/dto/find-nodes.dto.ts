import { IsBoolean, IsIn, IsOptional, IsString } from "class-validator"

export class FindNodesDto {
    @IsBoolean()
    @IsOptional()
    all?: boolean


    @IsString()
    @IsOptional()
    @IsIn(['private', 'public'])
    ownship?: string
}
