import { IsInt } from 'class-validator';
import {} from 'sequelize-typescript';

export class CreateSubscriptionDto {
    @IsInt({ each: true })
    nodeIds?: number[];
}
