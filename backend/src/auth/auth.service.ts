import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private subscriptionsService: SubscriptionsService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, device } = registerDto;

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with profile and style settings
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        profile: {
          create: {
            timezone: 'America/New_York',
          },
        },
        styleSettings: {
          create: {
            tone: 'casual',
            emojiLevel: 'normal',
            lengthPref: 'short',
            profanityOk: false,
          },
        },
      },
    });

    // Start 3-day trial
    await this.subscriptionsService.createTrial(user.id);

    // Register device
    const deviceRecord = await this.registerDevice(user.id, device);

    // Generate tokens
    const tokens = await this.generateTokens(user.id, deviceRecord.id);

    return {
      user: {
        id: user.id,
        email: user.email,
      },
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password, device } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Register or update device
    const deviceRecord = await this.registerDevice(user.id, device);

    // Generate tokens
    const tokens = await this.generateTokens(user.id, deviceRecord.id);

    return {
      user: {
        id: user.id,
        email: user.email,
      },
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    // Hash the provided token to compare
    const sessions = await this.prisma.session.findMany({
      where: {
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: { user: true, device: true },
    });

    // Find matching session by comparing hashed tokens
    let matchingSession = null;
    for (const session of sessions) {
      const isMatch = await bcrypt.compare(refreshToken, session.refreshToken);
      if (isMatch) {
        matchingSession = session;
        break;
      }
    }

    if (!matchingSession) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Revoke old session
    await this.prisma.session.update({
      where: { id: matchingSession.id },
      data: { revokedAt: new Date() },
    });

    // Generate new tokens
    const deviceId = matchingSession.deviceId || undefined;
    return this.generateTokens(matchingSession.userId, deviceId);
  }

  async logout(refreshToken: string) {
    const sessions = await this.prisma.session.findMany({
      where: {
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    // Find and revoke matching session
    for (const session of sessions) {
      const isMatch = await bcrypt.compare(refreshToken, session.refreshToken);
      if (isMatch) {
        await this.prisma.session.update({
          where: { id: session.id },
          data: { revokedAt: new Date() },
        });
        return;
      }
    }
  }

  private async registerDevice(userId: string, device: any) {
    const { device_id, platform, model, os_version } = device;

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

  private async generateTokens(userId: string, deviceId?: string) {
    const accessToken = this.jwtService.sign(
      { sub: userId },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m',
      },
    );

    const refreshToken = this.jwtService.sign(
      { sub: userId, type: 'refresh' },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '90d',
      },
    );

    // Hash and store refresh token
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90); // 90 days

    await this.prisma.session.create({
      data: {
        userId,
        deviceId,
        refreshToken: hashedRefreshToken,
        expiresAt,
      },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}

