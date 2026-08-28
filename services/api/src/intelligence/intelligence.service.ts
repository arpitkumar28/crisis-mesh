import { Injectable } from '@nestjs/common';
import { NewsService } from '../information/news.service';
import { WeatherService } from '../weather/weather.service';
import { WebSocketEventType } from '../websocket/dto/websocket-event.dto';
import { WebSocketService } from '../websocket/websocket.service';
import { DisasterFeedService } from './disaster-feed.service';

@Injectable()
export class IntelligenceService {
  private readonly seen = new Set<string>();
  constructor(private readonly disasters: DisasterFeedService, private readonly weather: WeatherService, private readonly news: NewsService, private readonly socket: WebSocketService) {}
  async getLatest() {
    const [disasters, news] = await Promise.all([this.disasters.find(true), this.news.find({ critical: true })]);
    const weather = (await Promise.all(disasters.filter((item) => item.latitude !== null && item.longitude !== null).slice(0, 20).map((item) => this.weather.getLiveAt(item.latitude!, item.longitude!)))).filter(Boolean);
    const records = [...disasters.map((item) => ({ id: `disaster:${item.eventId}`, kind: 'disaster', severity: this.severity(item.alertLevel), ...item })), ...news.map((item) => ({ id: `news:${item.id}`, kind: 'news', severity: item.severity, ...item })), ...weather.filter((item) => (item.weatherCode ?? 0) >= 95).map((item) => ({ id: `weather:${item.latitude}:${item.longitude}:${item.observedAt}`, kind: 'weather', severity: 'HIGH', ...item }))];
    records.forEach((record) => { if (!this.seen.has(record.id) && ['CRITICAL', 'HIGH'].includes(record.severity)) { this.seen.add(record.id); this.socket.broadcastIntelligence(WebSocketEventType.INTELLIGENCE_CREATED, record); if (record.kind === 'disaster') this.socket.broadcastIntelligence(WebSocketEventType.DISASTER_CREATED, record); if (record.kind === 'weather') this.socket.broadcastIntelligence(WebSocketEventType.WEATHER_UPDATED, record); } }); return records;
  }
  private severity(level: string | null) { const normalized = String(level || '').toLowerCase(); return normalized === 'red' ? 'CRITICAL' : normalized === 'orange' ? 'HIGH' : normalized === 'green' ? 'LOW' : 'INFO'; }
}