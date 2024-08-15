import { Optional } from "@nestjs/common"
import { IsInt, IsNumber, IsString, Max, MaxLength } from "class-validator"
import { Min } from "sequelize-typescript"

export class CreateReportDto {
    @IsString({ each: true })
    @Optional()
    images?: string[]

    @IsNumber({}, { each: true })
    coordinate?: number[]

    @IsString()
    @MaxLength(300)
    message?: string

    @IsInt()
    rating?: number
}
