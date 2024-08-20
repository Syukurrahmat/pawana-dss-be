import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-eventlog.dto.js';

export class UpdateEventDto extends PartialType(CreateEventDto) {}
