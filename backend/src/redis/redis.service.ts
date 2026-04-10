import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  public client: Redis;

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    this.client = redisUrl ? new Redis(redisUrl) : new Redis();
  }

  async setOnline(userId: string, socketId: string) {
    await this.client.hset('online_users', userId, socketId);
  }

  async setOffline(userId: string) {
    await this.client.hdel('online_users', userId);
  }

  async isOnline(userId: string): Promise<boolean> {
    return !!(await this.client.hget('online_users', userId));
  }

  async getOnlineUsers(): Promise<string[]> {
    const map = await this.client.hgetall('online_users');
    return Object.keys(map || {});
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
