import { ServiceUnavailableException } from '@nestjs/common';
import { NewsService } from './news.service';

describe('NewsService', () => {
  const fetchMock = jest.fn();
  let service: NewsService;

  beforeEach(() => {
    service = new NewsService();
    process.env.NEWS_API_KEY = 'server-only-test-key';
    global.fetch = fetchMock;
    fetchMock.mockReset();
  });

  it('normalizes provider records without fabricating location data', () => {
    const record = service.normalize({
      url: 'https://example.com/article',
      title: 'Major earthquake prompts emergency rescue',
      description: 'Authorities respond.',
      source: { name: 'Example News' },
      publishedAt: '2026-08-28T12:00:00Z',
    }, 'general');

    expect(record).toMatchObject({
      id: 'https://example.com/article',
      source: 'Example News',
      category: 'general',
      severity: 'HIGH',
      country: null,
      latitude: null,
      longitude: null,
    });
  });

  it('fetches and filters critical news using the server-side key', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'ok',
        articles: [
          { url: 'https://example.com/1', title: 'Earthquake emergency rescue', source: { name: 'A' } },
          { url: 'https://example.com/2', title: 'Local sports update', source: { name: 'B' } },
        ],
      }),
    });

    const records = await service.find({ critical: true });

    expect(records).toHaveLength(1);
    expect(records[0].url).toBe('https://example.com/1');
    const requestUrl = fetchMock.mock.calls[0][0].toString();
    expect(requestUrl).toContain('newsapi.org/v2/everything');
    expect(requestUrl).not.toContain('server-only-test-key');
    expect(fetchMock.mock.calls[0][1].headers['X-Api-Key']).toBe('server-only-test-key');
  });

  it('serves cached data when the provider fails', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'ok', articles: [{ url: 'https://example.com/1', title: 'Flood warning' }] }),
    });
    await service.find();
    (service as any).cache.get('{"critical":false}').expiresAt = 0;
    fetchMock.mockRejectedValueOnce(new Error('timeout'));

    await expect(service.find()).resolves.toHaveLength(1);
  });

  it('reports a clear error when no cache exists and the provider fails', async () => {
    delete process.env.NEWS_API_KEY;

    await expect(service.find()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});