import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateIncidentDto } from './create-incident.dto';
import { IsEnum } from 'class-validator';
import { IncidentStatus } from '../../entities/incident.entity';

export class UpdateIncidentDto extends PartialType(
  OmitType(CreateIncidentDto, [] as const)
) {
  @IsEnum(IncidentStatus)
  status?: IncidentStatus;
}
