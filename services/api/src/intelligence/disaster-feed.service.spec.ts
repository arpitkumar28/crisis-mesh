import { ServiceUnavailableException } from '@nestjs/common';
import { DisasterFeedService } from './disaster-feed.service';

describe('DisasterFeedService', () => {
  const fetchMock = jest.fn();
  let service: DisasterFeedService;
  beforeEach(() => { service = new DisasterFeedService(); global.fetch = fetchMock; fetchMock.mockReset(); process.env.GDACS_BASE_URL = 'https://gdacs.test'; });

  it('normalizes supported GDACS types and GeoJSON coordinates', () => {
    expect(service.normalize({ eventid: 'EQ-1', eventtype: 'EQ', name: 'Earthquake', geometry: { coordinates: [77.1, 28.6] }, alertlevel: 'Red' })).toMatchObject({ eventId: 'EQ-1', eventType: 'earthquake', latitude: 28.6, longitude: 77.1, alertLevel: 'Red' });
    expect(service.normalize({ eventid: 'OTHER', eventtype: 'VOLCANO' })).toBeNull();
  });

  it('deduplicates records by external event id', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ features: [{ properties: { eventid: 'EQ-1', eventtype: 'EQ', name: 'A' } }, { properties: { eventid: 'EQ-1', eventtype: 'EQ', name: 'A duplicate' } }] }) });
    const records = await service.find();
    expect(records).toHaveLength(1);
  });

  it('uses stale cache on provider failure and errors without cache', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ events: [{ eventid: 'FL-1', eventtype: 'FL' }] }) });
    await service.find();
    (service as any).cache.get('all').expiresAt = 0;
    fetchMock.mockRejectedValueOnce(new Error('timeout'));
    await expect(service.find()).resolves.toHaveLength(1);
    const empty = new DisasterFeedService();
    fetchMock.mockRejectedValueOnce(new Error('down'));
    await expect(empty.find()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});