import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WeatherObservation } from '../entities/weather-observation.entity';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly cache = new Map<
    string,
    { expiresAt: number; data: WeatherRecord }
  >();
  private readonly forecastCache = new Map<
    string,
    { expiresAt: number; data: WeatherForecast }
  >();

  constructor(
    @InjectRepository(WeatherObservation)
    private readonly weather: Repository<WeatherObservation>,
  ) {}

  async getLive(): Promise<WeatherRecord[]> {
    return this.findAll() as unknown as WeatherRecord[];
  }

  async getLiveAt(latitude: number, longitude: number): Promise<WeatherRecord> {
    const key = `${latitude.toFixed(3)},${longitude.toFixed(3)}`;
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.data;
    try {
      const data = await this.fetchLive(latitude, longitude);
      this.cache.set(key, { data, expiresAt: Date.now() + 7 * 60 * 1000 });
      return data;
    } catch (error) {
      if (cached) {
        this.logger.warn(
          `Open-Meteo unavailable; serving stale cache for ${key}`,
        );
        return cached.data;
      }
      throw new ServiceUnavailableException(
        `Weather data unavailable: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async getForecastAt(
    latitude: number,
    longitude: number,
  ): Promise<WeatherForecast> {
    const key = `forecast:${latitude.toFixed(3)},${longitude.toFixed(3)}`;
    const cached = this.forecastCache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.data;

    try {
      const data = await this.fetchForecast(latitude, longitude);
      this.forecastCache.set(key, {
        data,
        expiresAt: Date.now() + 7 * 60 * 1000,
      });
      return data;
    } catch (error) {
      if (cached) {
        this.logger.warn(
          `Open-Meteo unavailable; serving stale forecast cache for ${key}`,
        );
        return cached.data;
      }
      throw new ServiceUnavailableException(
        `Weather data unavailable: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async fetchLive(
    latitude: number,
    longitude: number,
  ): Promise<WeatherRecord> {
    const baseUrl = (
      process.env.OPEN_METEO_BASE_URL || 'https://api.open-meteo.com'
    ).replace(/\/+$/, '');
    const endpoint = new URL(`${baseUrl}/v1/forecast`);
    endpoint.searchParams.set('latitude', String(latitude));
    endpoint.searchParams.set('longitude', String(longitude));
    endpoint.searchParams.set(
      'current',
      'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_gusts_10m,surface_pressure,visibility',
    );
    endpoint.searchParams.set(
      'hourly',
      'temperature_2m,precipitation,weather_code',
    );
    endpoint.searchParams.set('forecast_days', '2');
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = (await response.json()) as OpenMeteoResponse;
    const current = payload.current;
    if (!current) throw new Error('Open-Meteo returned no current conditions');
    return {
      temperature: current.temperature_2m ?? null,
      humidity: current.relative_humidity_2m ?? null,
      windSpeed: current.wind_speed_10m ?? null,
      windGust: current.wind_gusts_10m ?? null,
      precipitation: current.precipitation ?? null,
      pressure: current.surface_pressure ?? null,
      visibility: current.visibility ?? null,
      weatherCode: current.weather_code ?? null,
      forecast: payload.hourly || null,
      observedAt: current.time || new Date().toISOString(),
      latitude,
      longitude,
      source: 'Open-Meteo',
    };
  }

  private async fetchForecast(
    latitude: number,
    longitude: number,
  ): Promise<WeatherForecast> {
    const baseUrl = (
      process.env.OPEN_METEO_BASE_URL || 'https://api.open-meteo.com'
    ).replace(/\/+$/, '');
    const endpoint = new URL(`${baseUrl}/v1/forecast`);
    endpoint.searchParams.set('latitude', String(latitude));
    endpoint.searchParams.set('longitude', String(longitude));
    endpoint.searchParams.set(
      'current',
      'temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,pressure_msl,weather_code',
    );
    endpoint.searchParams.set(
      'hourly',
      'temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,pressure_msl,weather_code',
    );
    endpoint.searchParams.set(
      'daily',
      'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max',
    );
    endpoint.searchParams.set('forecast_days', '7');

    const response = await fetch(endpoint, {
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = (await response.json()) as OpenMeteoForecastResponse;
    if (!payload.current || !payload.hourly || !payload.daily) {
      throw new Error('Open-Meteo returned an incomplete forecast');
    }

    return {
      location:
        payload.timezone || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      latitude,
      longitude,
      current: payload.current,
      hourly: payload.hourly,
      daily: payload.daily,
      updatedAt: new Date().toISOString(),
    };
  }

  async findAll() {
    return this.weather.find({
      order: { observation_time: 'DESC' },
      take: 100,
    });
  }

  async findLatest() {
    return this.weather.find({
      order: { observation_time: 'DESC' },
      take: 10,
    });
  }

  async findByLocation(locationId: string) {
    return this.weather.find({
      where: { location_id: locationId },
      order: { observation_time: 'DESC' },
      take: 24, // Last 24 hours
    });
  }

  async findOne(id: string) {
    return this.weather.findOne({
      where: { id },
    });
  }

  async getLatestByLocation(locationId: string) {
    return this.weather.findOne({
      where: { location_id: locationId },
      order: { observation_time: 'DESC' },
    });
  }
}

export type WeatherRecord = {
  temperature: number | null;
  humidity: number | null;
  windSpeed: number | null;
  windGust: number | null;
  precipitation: number | null;
  pressure: number | null;
  visibility: number | null;
  weatherCode: number | null;
  forecast: unknown;
  observedAt: string;
  latitude: number;
  longitude: number;
  source: string;
};
type OpenMeteoResponse = {
  current?: Record<string, any>;
  hourly?: Record<string, any>;
};
export type WeatherForecast = {
  location: string;
  latitude: number;
  longitude: number;
  current: Record<string, unknown>;
  hourly: Record<string, unknown>;
  daily: Record<string, unknown>;
  updatedAt: string;
};
type OpenMeteoForecastResponse = {
  timezone?: string;
  current?: Record<string, unknown>;
  hourly?: Record<string, unknown>;
  daily?: Record<string, unknown>;
};
