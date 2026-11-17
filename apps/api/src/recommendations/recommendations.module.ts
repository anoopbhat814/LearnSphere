import { Module } from '@nestjs/common';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';
import { RedisService } from '../common/redis.service';

@Module({ controllers: [RecommendationsController], providers: [RecommendationsService, RedisService] })
export class RecommendationsModule {}
