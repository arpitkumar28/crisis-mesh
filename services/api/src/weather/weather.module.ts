import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WeatherController } from './weather.controller';
import { PublicWeatherController } from './public-weather.controller';
import { WeatherService } from './weather.service';
import { WeatherObservation } from '../entities/weather-observation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WeatherObservation])],
  controllers: [PublicWeatherController, WeatherController],
  providers: [WeatherService],
  exports: [WeatherService],
})
export class WeatherModule {}
