import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'healthy' },
        database: { type: 'string', example: 'connected' },
        timestamp: { type: 'string', example: '2025-01-25T10:00:00.000Z' },
      },
    },
  })
  async check() {
    return this.healthService.checkHealth();
  }
}

