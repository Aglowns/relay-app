import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { StyleService } from '../style/style.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { GenerateMessageDto } from './dto/generate-message.dto';
import OpenAI from 'openai';

@Injectable()
export class MessagesService {
  private openai: OpenAI | null = null;

  constructor(
    private prisma: PrismaService,
    private styleService: StyleService,
    private subscriptionsService: SubscriptionsService,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async generate(userId: string, dto: GenerateMessageDto) {
    // Check subscription expiration
    const isSubscriptionValid = await this.subscriptionsService.checkSubscriptionExpiration(userId);
    if (!isSubscriptionValid) {
      throw new HttpException(
        'Subscription expired or inactive',
        HttpStatus.FORBIDDEN,
      );
    }

    // Check daily usage limits
    await this.checkUsageLimits(userId);

    // Validate total input length
    const totalLength = dto.incoming_messages.reduce((sum, msg) => sum + msg.text.length, 0);
    if (totalLength > 5000) {
      throw new HttpException(
        'Total message context exceeds 5000 characters',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Get user style settings
    const styleSettings = await this.styleService.getStyle(userId);
    
    // Merge with override
    const finalStyle = {
      tone: dto.style_override?.tone || styleSettings.tone,
      emojiLevel: dto.style_override?.emoji_level || styleSettings.emoji_level,
      lengthPref: dto.style_override?.length_pref || styleSettings.length_pref,
      profanityOk: styleSettings.profanity_ok,
    };

    // Build prompt
    const prompt = this.buildPrompt(dto.incoming_messages, finalStyle);
    const nSuggestions = dto.n_suggestions || 3;

    // Call LLM
    const suggestions = await this.callLLM(prompt, nSuggestions, finalStyle);

    // Store generation
    const inputSnippet = dto.incoming_messages
      .map(m => m.text)
      .join(' ')
      .substring(0, 200);

    await this.prisma.messageGeneration.create({
      data: {
        userId,
        inputSnippet,
        styleSnapshot: finalStyle,
        suggestions: suggestions,
        provider: 'openai',
      },
    });

    // Increment daily usage
    await this.incrementDailyUsage(userId);

    return {
      suggestions: suggestions.map((s, i) => ({
        id: `s${i + 1}`,
        text: s,
        tone: finalStyle.tone,
      })),
    };
  }

  private async checkUsageLimits(userId: string) {
    const subscription = await this.subscriptionsService.getSubscription(userId);
    const dailyLimit = subscription?.planType === 'pro' 
      ? parseInt(process.env.PRO_PLAN_DAILY_LIMIT || '10000', 10)
      : parseInt(process.env.FREE_PLAN_DAILY_LIMIT || '100', 10);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const usage = await this.prisma.usageDailyTotal.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });

    if (usage && usage.requests >= dailyLimit) {
      throw new HttpException(
        'Daily usage limit exceeded',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private async incrementDailyUsage(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await this.prisma.usageDailyTotal.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: {
        requests: {
          increment: 1,
        },
      },
      create: {
        userId,
        date: today,
        requests: 1,
      },
    });
  }

  private buildPrompt(messages: any[], style: any): string {
    const context = messages
      .map(m => `${m.from_me ? 'You' : 'Them'}: ${m.text}`)
      .join('\n');

    const toneDesc = {
      casual: 'casual and friendly',
      neutral: 'neutral and balanced',
      formal: 'professional and formal',
    }[style.tone] || 'casual';

    const lengthDesc = {
      short: 'Keep responses brief (1-2 sentences)',
      medium: 'Keep responses moderate (2-4 sentences)',
      long: 'Responses can be longer if needed',
    }[style.lengthPref] || 'Keep responses brief';

    const emojiDesc = {
      none: 'Do not use emojis',
      low: 'Use emojis sparingly',
      normal: 'Use emojis when appropriate',
      high: 'Use emojis frequently',
    }[style.emojiLevel] || 'Use emojis when appropriate';

    return `You are a helpful message assistant. Generate ${style.nSuggestions || 3} different reply suggestions based on this conversation:

${context}

Requirements:
- Tone: ${toneDesc}
- ${lengthDesc}
- ${emojiDesc}
- Make each suggestion distinct and natural
- Return only the message text, no explanations

Generate ${style.nSuggestions || 3} suggestions, one per line:`;
  }

  private async callLLM(prompt: string, nSuggestions: number, style: any): Promise<string[]> {
    if (!this.openai) {
      // Fallback mock responses for testing
      return [
        'Sure, I can help with that!',
        'Got it, will do.',
        'Sounds good to me.',
      ].slice(0, nSuggestions);
    }

    try {
      const model = this.configService.get<string>('OPENAI_MODEL') || 'gpt-4o-mini';
      
      const response = await this.openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful message assistant. Generate natural, contextually appropriate message suggestions.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        n: nSuggestions,
        temperature: 0.8,
      });

      return response.choices
        .map(choice => choice.message.content?.trim() || '')
        .filter(Boolean);
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new HttpException(
        'Failed to generate suggestions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

