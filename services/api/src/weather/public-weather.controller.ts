import { Controller, Get, Param, ParseFloatPipe, Query } from '@nestjs/common';
import { WeatherService } from './weather.service';

@Controller('v1/public/weather')
export class PublicWeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  async findAll(
    @Query('latitude') latitude?: string,
    @Query('longitude') longitude?: string,
  ) {
    const weather =
      latitude !== undefined && longitude !== undefined
        ? [
            await this.weatherService.getLiveAt(
              Number(latitude),
              Number(longitude),
            ),
          ]
        : await this.weatherService.getLive();
    return {
      success: true,
      message: 'Weather observations retrieved successfully',
      data: weather,
      request_id: crypto.randomUUID(),
    };
  }

  @Get(':latitude/:longitude')
  async findAt(
    @Param('latitude', ParseFloatPipe) latitude: number,
    @Param('longitude', ParseFloatPipe) longitude: number,
  ) {
    return {
      success: true,
      data: await this.weatherService.getLiveAt(latitude, longitude),
      request_id: crypto.randomUUID(),
    };
  }

  @Get('latest')
  async findLatest() {
    const weather = await this.weatherService.findLatest();
    return {
      success: true,
      message: 'Latest weather observations retrieved successfully',
      data: weather,
      request_id: crypto.randomUUID(),
    };
  }

  @Get('location/:locationId')
  async findByLocation(@Param('locationId') locationId: string) {
    const weather = await this.weatherService.findByLocation(locationId);
    return {
      success: true,
      message: 'Weather observations for location retrieved successfully',
      data: weather,
      request_id: crypto.randomUUID(),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const weather = await this.weatherService.findOne(id);
    return {
      success: true,
      message: 'Weather observation retrieved successfully',
      data: weather,
      request_id: crypto.randomUUID(),
    };
  }
}
