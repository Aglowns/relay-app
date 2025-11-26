import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      // Connection pooling configuration for Supabase
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  async onModuleInit() {
    // Temporarily skip connection on startup due to network issues
    // Connection will be established on first query
    try {
      await this.$connect();
    } catch (error) {
      console.warn('Database connection failed on startup, will retry on first query:', error.message);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

