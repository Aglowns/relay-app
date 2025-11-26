import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async createTrial(userId: string) {
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 3); // 3-day trial

    return this.prisma.subscription.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        planType: 'trial',
        status: 'active',
        trialEndsAt,
      },
    });
  }

  async getSubscription(userId: string) {
    return this.prisma.subscription.findUnique({
      where: { userId },
    });
  }

  async checkSubscriptionExpiration(userId: string): Promise<boolean> {
    const subscription = await this.getSubscription(userId);
    
    if (!subscription) {
      return false;
    }

    const now = new Date();
    let isExpired = false;

    // Check trial expiration
    if (subscription.planType === 'trial' && subscription.trialEndsAt) {
      if (now > subscription.trialEndsAt && subscription.status === 'active') {
        isExpired = true;
        await this.prisma.subscription.update({
          where: { userId },
          data: { status: 'expired' },
        });
      }
    }

    // Check subscription period expiration
    if (subscription.currentPeriodEnd) {
      if (now > subscription.currentPeriodEnd && subscription.status === 'active') {
        isExpired = true;
        await this.prisma.subscription.update({
          where: { userId },
          data: { status: 'expired' },
        });
      }
    }

    return !isExpired && subscription.status === 'active';
  }

  async updateSubscription(userId: string, planType: string, status: string) {
    let currentPeriodEnd: Date | null = null;
    
    if (planType === 'monthly') {
      currentPeriodEnd = new Date();
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    } else if (planType === 'yearly') {
      currentPeriodEnd = new Date();
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    }

    return this.prisma.subscription.upsert({
      where: { userId },
      update: {
        planType,
        status,
        currentPeriodEnd,
      },
      create: {
        userId,
        planType,
        status,
        currentPeriodEnd,
      },
    });
  }
}

