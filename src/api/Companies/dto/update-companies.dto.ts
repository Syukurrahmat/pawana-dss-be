import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { CreateCompaniesDto } from './create-companies.dto';

export class UpdateCompaniesDto extends PartialType(OmitType(CreateCompaniesDto, ['managerId'])) {}
