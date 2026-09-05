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

describe('WeatherService.searchLocations', () => {
  const fetchMock = jest.fn();
  let service: WeatherService;
  beforeEach(() => {
    service = new WeatherService({} as any);
    global.fetch = fetchMock;
    fetchMock.mockReset();
    process.env.OPEN_METEO_GEOCODING_BASE_URL = 'https://geocode.test';
  });

  it('returns [] without calling the provider for a too-short query', async () => {
    await expect(service.searchLocations('J')).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('maps real geocoding results to name/state/country/coordinates', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          { name: 'Jaipur', admin1: 'Rajasthan', country: 'India', latitude: 26.9124, longitude: 75.7873 },
          { name: 'Jaipur Rural', admin1: 'Rajasthan', country: 'India', latitude: 26.8, longitude: 75.6 },
        ],
      }),
    });

    const results = await service.searchLocations('Jaipur');

    expect(results).toEqual([
      { name: 'Jaipur', state: 'Rajasthan', country: 'India', latitude: 26.9124, longitude: 75.7873 },
      { name: 'Jaipur Rural', state: 'Rajasthan', country: 'India', latitude: 26.8, longitude: 75.6 },
    ]);
    const calledUrl = fetchMock.mock.calls[0][0].toString();
    expect(calledUrl).toContain('geocode.test/v1/search');
    expect(calledUrl).toContain('countryCode=IN');
    expect(calledUrl).toContain('name=Jaipur');
  });

  it('returns [] when the provider has no match, rather than throwing', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({}) });
    await expect(service.searchLocations('Nonexistentplacexyz')).resolves.toEqual([]);
  });

  it('serves stale cache on provider failure and errors without cache', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [{ name: 'Delhi', admin1: 'Delhi', country: 'India', latitude: 28.6, longitude: 77.2 }] }),
    });
    await service.searchLocations('Delhi');
    (service as any).geocodeCache.get('delhi').expiresAt = 0;
    fetchMock.mockRejectedValueOnce(new Error('timeout'));
    await expect(service.searchLocations('Delhi')).resolves.toMatchObject([{ name: 'Delhi' }]);

    const empty = new WeatherService({} as any);
    fetchMock.mockRejectedValueOnce(new Error('down'));
    await expect(empty.searchLocations('Mumbai')).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});