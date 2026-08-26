import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateAlertDto } from './create-alert.dto';
import { IsEnum } from 'class-validator';
import { AlertStatus } from '../../entities/alert.entity';

export class UpdateAlertDto extends PartialType(
  OmitType(CreateAlertDto, [] as const)
) {
  @IsEnum(AlertStatus)
  status?: AlertStatus;
}
