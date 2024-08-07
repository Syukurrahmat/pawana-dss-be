import { Optional } from "@nestjs/common"
import { IsInt, IsString, Max, MaxLength } from "class-validator"
import { Min } from "sequelize-typescript"

export class CreateReportDto {
    @IsString({ each: true })
    @Optional()
    images?: string[]

    @IsInt({ each: true })
    coordinate?: number[]

    @IsString()
    @MaxLength(300)
    message?: string

    @IsInt()
    rating?: number
}
