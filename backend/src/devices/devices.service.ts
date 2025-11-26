import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { RegisterDeviceDto } from './dto/register-device.dto';

@Injectable()
export class DevicesService {
  constructor(private prisma: PrismaService) {}

  async registerDevice(userId: string, dto: RegisterDeviceDto) {
    const { device_id, platform, model, os_version } = dto;

    return this.prisma.device.upsert({
      where: {
        userId_deviceId: {
          userId,
          deviceId: device_id,
        },
      },
      update: {
        lastSeenAt: new Date(),
        model,
        osVersion: os_version,
      },
      create: {
        userId,
        deviceId: device_id,
        platform,
        model,
        osVersion: os_version,
      },
    });
  }

  async getDevices(userId: string) {
    return this.prisma.device.findMany({
      where: { userId },
      select: {
        id: true,
        deviceId: true,
        platform: true,
        model: true,
        osVersion: true,
        createdAt: true,
        lastSeenAt: true,
      },
    });
  }
}

