import {
  IsEnum,
  IsString,
  IsOptional,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { IncidentType, IncidentSeverity } from '../../entities/incident.entity';

export class CreateIncidentDto {
  @IsEnum(IncidentType)
  type: IncidentType;

  @IsString()
  @MaxLength(500)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  location_id?: string;

  @IsOptional()
  @IsEnum(IncidentSeverity)
  severity?: IncidentSeverity;

  @IsOptional()
  @IsString()
  assigned_to?: string;
}
