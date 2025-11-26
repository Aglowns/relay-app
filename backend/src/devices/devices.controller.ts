import { Controller, Get, Post, UseGuards, Request, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { DevicesService } from './devices.service';
import { RegisterDeviceDto } from './dto/register-device.dto';

@ApiTags('devices')
@Controller('v1/devices')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('JWT-auth')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new device' })
  @ApiBody({ type: RegisterDeviceDto })
  @ApiResponse({
    status: 201,
    description: 'Device successfully registered',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
        deviceId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
        platform: { type: 'string', example: 'ios' },
        model: { type: 'string', example: 'iPhone 15' },
        osVersion: { type: 'string', example: '18.0' },
        createdAt: { type: 'string', example: '2025-01-25T10:00:00.000Z' },
        lastSeenAt: { type: 'string', example: '2025-01-25T10:00:00.000Z' },
      },
    },
  })
  async registerDevice(@Request() req, @Body() registerDeviceDto: RegisterDeviceDto) {
    return this.devicesService.registerDevice(req.user.id, registerDeviceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user devices' })
  @ApiResponse({
    status: 200,
    description: 'Devices retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
          deviceId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
          platform: { type: 'string', example: 'ios' },
          model: { type: 'string', example: 'iPhone 15' },
          osVersion: { type: 'string', example: '18.0' },
          createdAt: { type: 'string', example: '2025-01-25T10:00:00.000Z' },
          lastSeenAt: { type: 'string', example: '2025-01-25T10:00:00.000Z' },
        },
      },
    },
  })
  async getDevices(@Request() req) {
    return this.devicesService.getDevices(req.user.id);
  }
}

