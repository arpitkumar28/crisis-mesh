import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Resource } from '../entities/resource.entity';
import { Shelter } from '../entities/shelter.entity';
import { ResponseController } from './response.controller';
import { ResponseService } from './response.service';

@Module({ imports: [AuthModule, TypeOrmModule.forFeature([Resource, Shelter])], controllers: [ResponseController], providers: [ResponseService] })
export class ResponseModule {}
