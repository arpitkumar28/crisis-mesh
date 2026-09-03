import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsArticle } from '../entities/news-article.entity';
import { Notification } from '../entities/notification.entity';
import { WeatherObservation } from '../entities/weather-observation.entity';
import { InformationController } from './information.controller';
import { InformationService } from './information.service';
import { NewsService } from './news.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WeatherObservation, NewsArticle, Notification]),
  ],
  controllers: [InformationController],
  providers: [InformationService, NewsService],
  exports: [NewsService],
})
export class InformationModule {}
