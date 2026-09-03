import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DistrictsController } from './districts.controller';
import { PublicDistrictsController } from './public-districts.controller';
import { DistrictsService } from './districts.service';
import { District } from '../entities/district.entity';
import { RiskAssessment } from '../entities/risk-assessment.entity';
import { Alert } from '../entities/alert.entity';
import { Incident } from '../entities/incident.entity';
import { Device } from '../entities/device.entity';
import { WeatherObservation } from '../entities/weather-observation.entity';
import { Shelter } from '../entities/shelter.entity';
import { Resource } from '../entities/resource.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      District,
      RiskAssessment,
      Alert,
      Incident,
      Device,
      WeatherObservation,
      Shelter,
      Resource,
    ]),
  ],
  controllers: [DistrictsController, PublicDistrictsController],
  providers: [DistrictsService],
  exports: [DistrictsService],
})
export class DistrictsModule {}
