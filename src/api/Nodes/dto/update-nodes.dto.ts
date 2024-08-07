import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateNodeDto } from './create-nodes.dto';

export class UpdateNodeDto extends PartialType(OmitType(CreateNodeDto, ['companyId'])) {

}
