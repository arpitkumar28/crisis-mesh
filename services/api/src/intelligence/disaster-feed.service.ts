import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';

export type DisasterRecord = {
  eventId: string;
  eventType: 'earthquake' | 'flood' | 'cyclone';
  title: string;
  alertLevel: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  magnitude: number | null;
  populationAffected: number | null;
  startedAt: string | null;
  updatedAt: string | null;
  sourceUrl: string | null;
};

@Injectable()
export class DisasterFeedService {
  private readonly logger = new Logger(DisasterFeedService.name);
  private readonly cache = new Map<
    string,
    { expiresAt: number; data: DisasterRecord[] }
  >();
  async find(active = false): Promise<DisasterRecord[]> {
    const key = active ? 'active' : 'all';
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.data;
    try {
      const data = await this.fetchFeed(active);
      this.cache.set(key, { data, expiresAt: Date.now() + 3 * 60 * 1000 });
      return data;
    } catch (error) {
      if (cached) {
        this.logger.warn('GDACS unavailable; serving stale cache');
        return cached.data;
      }
      throw new ServiceUnavailableException(
        `Disaster data unavailable: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
  async findOne(eventId: string) {
    return (await this.find()).find((item) => item.eventId === eventId) || null;
  }
  normalize(raw: any): DisasterRecord | null {
    const eventId = String(raw.eventid ?? raw.eventId ?? raw.id ?? '').trim();
    const type = String(
      raw.eventtype ?? raw.eventType ?? raw.type ?? '',
    ).toLowerCase();
    const eventType =
      type.includes('eq') || type.includes('earth')
        ? 'earthquake'
        : type.includes('fl') || type.includes('flood')
          ? 'flood'
          : type.includes('tc') ||
              type.includes('cycl') ||
              type.includes('trop')
            ? 'cyclone'
            : null;
    const latitude = Number(
      raw.latitude ??
        raw.lat ??
        raw.point?.lat ??
        raw.geometry?.coordinates?.[1],
    );
    const longitude = Number(
      raw.longitude ??
        raw.lon ??
        raw.lng ??
        raw.point?.lon ??
        raw.geometry?.coordinates?.[0],
    );
    if (!eventId || !eventType) return null;
    return {
      eventId,
      eventType,
      title: String(raw.name ?? raw.title ?? `${eventType} event`),
      alertLevel: raw.alertlevel ?? raw.alertLevel ?? null,
      country: raw.country ?? raw.countryname ?? null,
      latitude: Number.isFinite(latitude) ? latitude : null,
      longitude: Number.isFinite(longitude) ? longitude : null,
      magnitude: Number.isFinite(Number(raw.magnitude))
        ? Number(raw.magnitude)
        : null,
      populationAffected: Number.isFinite(Number(raw.population))
        ? Number(raw.population)
        : null,
      startedAt: raw.fromdate ?? raw.startedAt ?? null,
      updatedAt: raw.todate ?? raw.updatedAt ?? null,
      sourceUrl: raw.url ?? raw.sourceUrl ?? null,
    };
  }
  private async fetchFeed(active: boolean) {
    const baseUrl = (
      process.env.GDACS_BASE_URL || 'https://www.gdacs.org/gdacsapi'
    ).replace(/\/+$/, '');
    const endpoint = new URL(`${baseUrl}/api/events/geteventlist/SEARCH`);
    endpoint.searchParams.set('eventtype', 'EQ,FL,TC');
    if (active) endpoint.searchParams.set('alertlevel', 'green,orange,red');
    const response = await fetch(endpoint, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = (await response.json()) as any;
    const source = Array.isArray(payload)
      ? payload
      : payload.features || payload.events || payload.data || [];
    const records = source
      .map((item: any) => this.normalize(item.properties || item))
      .filter(Boolean) as DisasterRecord[];
    return [
      ...new Map(records.map((record) => [record.eventId, record])).values(),
    ];
  }
}
