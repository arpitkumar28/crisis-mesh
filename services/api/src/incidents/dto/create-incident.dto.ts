import { IsEnum, IsString, IsOptional, IsDateString, MaxLength } from 'class-validator';
import { IncidentType } from '../../entities/incident.entity';
import { AlertSeverity } from '../../entities/alert.entity';

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
  @IsEnum(AlertSeverity)
  severity?: AlertSeverity;

  @IsOptional()
  @IsString()
  assigned_to?: string;
}
