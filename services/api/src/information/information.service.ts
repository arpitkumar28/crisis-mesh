import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsArticle } from '../entities/news-article.entity';
import { Notification } from '../entities/notification.entity';
import { WeatherObservation } from '../entities/weather-observation.entity';

@Injectable()
export class InformationService {
  constructor(
    @InjectRepository(WeatherObservation) private readonly weather: Repository<WeatherObservation>,
    @InjectRepository(NewsArticle) private readonly news: Repository<NewsArticle>,
    @InjectRepository(Notification) private readonly notifications: Repository<Notification>,
  ) {}
  weatherLatest() { return this.weather.find({ order: { observation_time: 'DESC' }, take: 30 }); }
  newsLatest() { return this.news.find({ order: { published_at: 'DESC', created_at: 'DESC' }, take: 50 }); }
  notificationsFor(recipientId: string) { return this.notifications.find({ where: { recipient_id: recipientId }, order: { created_at: 'DESC' }, take: 100 }); }
  async markNotificationRead(id: string, recipientId: string) { const notification = await this.notifications.findOne({ where: { id, recipient_id: recipientId } }); if (!notification) throw new NotFoundException('Notification not found'); notification.is_read = true; notification.read_at = new Date(); return this.notifications.save(notification); }
}
