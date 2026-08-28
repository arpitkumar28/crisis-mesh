import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { InformationService } from './information.service';
import { NewsService } from './news.service';

type AuthenticatedUser = { id: string };

@Controller('v1')
export class InformationController {
  constructor(private readonly information: InformationService, private readonly newsService: NewsService) {}
  @Get('news/critical') criticalNews(@Query('country') country?: string, @Query('category') category?: string, @Query('query') query?: string) {
    return this.newsService.find({ country, category, query, critical: true });
  }
  @Get('news') news(@Query('country') country?: string, @Query('category') category?: string, @Query('query') query?: string) {
    return this.newsService.find({ country, category, query });
  }
  @Get('notifications') @UseGuards(JwtAuthGuard) notifications(@CurrentUser() user: AuthenticatedUser) { return this.information.notificationsFor(user.id); }
  @Patch('notifications/:id/read') @UseGuards(JwtAuthGuard) read(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.information.markNotificationRead(id, user.id); }
}
