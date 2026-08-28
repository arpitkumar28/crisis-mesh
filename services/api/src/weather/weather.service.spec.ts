import { ServiceUnavailableException } from '@nestjs/common';
import { WeatherService } from './weather.service';

describe('WeatherService live provider', () => {
  const fetchMock = jest.fn();
  let service: WeatherService;
  beforeEach(() => { service = new WeatherService({} as any); global.fetch = fetchMock; fetchMock.mockReset(); process.env.OPEN_METEO_BASE_URL = 'https://weather.test'; });

  it('normalizes current conditions and forecast', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ current: { time: '2026-08-28T12:00', temperature_2m: 31, relative_humidity_2m: 60, wind_speed_10m: 12, wind_gusts_10m: 20, precipitation: 1, surface_pressure: 1008, visibility: 9000, weather_code: 95 }, hourly: { time: ['2026-08-28T12:00'] } }) });
    await expect(service.getLiveAt(28.6, 77.1)).resolves.toMatchObject({ temperature: 31, humidity: 60, weatherCode: 95, latitude: 28.6, longitude: 77.1 });
    expect(fetchMock.mock.calls[0][0].toString()).toContain('weather.test/v1/forecast');
  });

  it('uses stale cache on provider failure and errors without cache', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ current: { time: 'now', temperature_2m: 20 } }) });
    await service.getLiveAt(1, 2);
    (service as any).cache.get('1.000,2.000').expiresAt = 0;
    fetchMock.mockRejectedValueOnce(new Error('timeout'));
    await expect(service.getLiveAt(1, 2)).resolves.toMatchObject({ temperature: 20 });
    const empty = new WeatherService({} as any);
    fetchMock.mockRejectedValueOnce(new Error('down'));
    await expect(empty.getLiveAt(3, 4)).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});