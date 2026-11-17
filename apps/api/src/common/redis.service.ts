import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly client = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');

  async cached<T>(key: string, ttlSeconds: number, loader: () => Promise<T>): Promise<T> {
    const hit = await this.client.get(key);
    if (hit) return JSON.parse(hit) as T;
    const value = await loader();
    await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    return value;
  }

  async enqueue(queue: string, job: Record<string, unknown>): Promise<void> {
    await this.client.lpush(queue, JSON.stringify(job));
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length) await this.client.del(...keys);
  }
}
