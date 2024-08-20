import { IsInt } from 'class-validator';

export class CreateSubscriptionDto {
    @IsInt({ each: true })
    nodeIds?: number[];
}
