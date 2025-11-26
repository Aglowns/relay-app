import { IsOptional, IsString, IsBoolean, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStyleDto {
  @ApiProperty({ 
    description: 'Tone of messages', 
    example: 'casual',
    enum: ['casual', 'neutral', 'formal'],
    required: false 
  })
  @IsOptional()
  @IsString()
  @IsIn(['casual', 'neutral', 'formal'])
  tone?: string;

  @ApiProperty({ 
    description: 'Emoji usage level', 
    example: 'normal',
    enum: ['none', 'low', 'normal', 'high'],
    required: false 
  })
  @IsOptional()
  @IsString()
  @IsIn(['none', 'low', 'normal', 'high'])
  emoji_level?: string;

  @ApiProperty({ 
    description: 'Message length preference', 
    example: 'short',
    enum: ['short', 'medium', 'long'],
    required: false 
  })
  @IsOptional()
  @IsString()
  @IsIn(['short', 'medium', 'long'])
  length_pref?: string;

  @ApiProperty({ 
    description: 'Allow profanity', 
    example: false,
    required: false 
  })
  @IsOptional()
  @IsBoolean()
  profanity_ok?: boolean;
}

