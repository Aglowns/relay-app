import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}

  async checkHealth(): Promise<{
    status: string;
    database: string;
    timestamp: string;
  }> {
    let databaseStatus = 'disconnected';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      databaseStatus = 'connected';
    } catch (error) {
      databaseStatus = 'disconnected';
    }

    return {
      status: databaseStatus === 'connected' ? 'healthy' : 'unhealthy',
      database: databaseStatus,
      timestamp: new Date().toISOString(),
    };
  }
}

