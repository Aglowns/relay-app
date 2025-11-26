import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { UpdateStyleDto } from './dto/update-style.dto';

@Injectable()
export class StyleService {
  constructor(private prisma: PrismaService) {}

  async getStyle(userId: string) {
    const style = await this.prisma.userStyleSettings.findUnique({
      where: { userId },
    });

    if (!style) {
      // Create default if doesn't exist
      const newStyle = await this.prisma.userStyleSettings.create({
        data: {
          userId,
          tone: 'casual',
          emojiLevel: 'normal',
          lengthPref: 'short',
          profanityOk: false,
        },
      });

      return {
        tone: newStyle.tone,
        emoji_level: newStyle.emojiLevel,
        length_pref: newStyle.lengthPref,
        profanity_ok: newStyle.profanityOk,
      };
    }

    return {
      tone: style.tone,
      emoji_level: style.emojiLevel,
      length_pref: style.lengthPref,
      profanity_ok: style.profanityOk,
    };
  }

  async updateStyle(userId: string, updateStyleDto: UpdateStyleDto) {
    const { tone, emoji_level, length_pref, profanity_ok } = updateStyleDto;

    const style = await this.prisma.userStyleSettings.upsert({
      where: { userId },
      update: {
        ...(tone && { tone }),
        ...(emoji_level && { emojiLevel: emoji_level }),
        ...(length_pref && { lengthPref: length_pref }),
        ...(profanity_ok !== undefined && { profanityOk: profanity_ok }),
      },
      create: {
        userId,
        tone: tone || 'casual',
        emojiLevel: emoji_level || 'normal',
        lengthPref: length_pref || 'short',
        profanityOk: profanity_ok || false,
      },
    });

    return {
      tone: style.tone,
      emoji_level: style.emojiLevel,
      length_pref: style.lengthPref,
      profanity_ok: style.profanityOk,
    };
  }
}

