import { Module } from '@nestjs/common';
import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentsService } from './enrollments.service';
import { RedisService } from '../common/redis.service';

@Module({ controllers: [EnrollmentsController], providers: [EnrollmentsService, RedisService], exports: [EnrollmentsService] })
export class EnrollmentsModule {}
