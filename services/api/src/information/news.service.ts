import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';

export type NewsQuery = {
  country?: string;
  category?: string;
  query?: string;
  critical?: boolean;
};

export type NewsRecord = {
  id: string;
  title: string;
  description: string | null;
  source: string | null;
  url: string;
  imageUrl: string | null;
  publishedAt: string | null;
  country: string | null;
  category: string | null;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  latitude: number | null;
  longitude: number | null;
};

type NewsApiArticle = {
  url?: string;
  title?: string;
  description?: string | null;
  content?: string | null;
  urlToImage?: string | null;
  publishedAt?: string | null;
  source?: { id?: string | null; name?: string | null };
};

type NewsApiResponse = { status?: string; articles?: NewsApiArticle[] };

const DISASTER_KEYWORDS = [
  'earthquake',
  'flood',
  'cyclone',
  'hurricane',
  'tsunami',
  'wildfire',
  'volcano',
  'landslide',
  'storm',
  'tornado',
  'drought',
  'extreme heat',
  'extreme cold',
  'disaster',
  'evacuation',
  'emergency',
  'rescue',
];

const CACHE_TTL_MS = 3 * 60 * 1000;

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);
  private readonly cache = new Map<
    string,
    { expiresAt: number; data: NewsRecord[] }
  >();

  async find(query: NewsQuery = {}): Promise<NewsRecord[]> {
    const cacheKey = JSON.stringify({
      ...query,
      critical: Boolean(query.critical),
    });
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.data;

    try {
      const data = await this.fetchNews(query);
      this.cache.set(cacheKey, { data, expiresAt: Date.now() + CACHE_TTL_MS });
      return data;
    } catch (error) {
      if (cached) {
        this.logger.warn(
          `News provider unavailable; serving stale cache for ${cacheKey}`,
        );
        return cached.data;
      }
      const message =
        error instanceof Error ? error.message : 'News provider unavailable';
      throw new ServiceUnavailableException(
        `News data unavailable: ${message}`,
      );
    }
  }

  private async fetchNews(query: NewsQuery): Promise<NewsRecord[]> {
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) throw new Error('NEWS_API_KEY is not configured');

    const useHeadlines = Boolean(query.country || query.category);
    const endpoint = new URL(
      `https://newsapi.org/v2/${useHeadlines ? 'top-headlines' : 'everything'}`,
    );
    if (query.country) endpoint.searchParams.set('country', query.country);
    if (query.category) endpoint.searchParams.set('category', query.category);
    if (query.query) endpoint.searchParams.set('q', query.query);
    if (!useHeadlines && !query.query)
      endpoint.searchParams.set('q', DISASTER_KEYWORDS.join(' OR '));
    endpoint.searchParams.set('language', 'en');
    endpoint.searchParams.set('pageSize', '50');
    endpoint.searchParams.set('sortBy', 'publishedAt');

    const response = await fetch(endpoint, {
      headers: { 'X-Api-Key': apiKey },
    });
    const payload = (await response.json()) as NewsApiResponse & {
      message?: string;
    };
    if (!response.ok || payload.status !== 'ok')
      throw new Error(payload.message || `HTTP ${response.status}`);

    const records = (payload.articles || [])
      .filter((article) =>
        Boolean(article.url && article.title && article.title !== '[Removed]'),
      )
      .map((article) => this.normalize(article, query.category))
      .filter(
        (article) =>
          !query.critical ||
          article.severity === 'CRITICAL' ||
          article.severity === 'HIGH',
      );
    return records;
  }

  normalize(article: NewsApiArticle, category?: string): NewsRecord {
    const text =
      `${article.title || ''} ${article.description || ''}`.toLowerCase();
    const matches = DISASTER_KEYWORDS.filter((keyword) =>
      text.includes(keyword),
    );
    const severity =
      matches.length >= 2 ? 'HIGH' : matches.length === 1 ? 'MEDIUM' : 'INFO';
    return {
      id: article.url as string,
      title: article.title as string,
      description: article.description || article.content || null,
      source: article.source?.name || null,
      url: article.url as string,
      imageUrl: article.urlToImage || null,
      publishedAt: article.publishedAt || null,
      country: null,
      category: category || matches[0] || 'general',
      severity,
      latitude: null,
      longitude: null,
    };
  }
}
