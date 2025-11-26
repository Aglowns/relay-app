import { IsArray, IsObject, IsOptional, IsInt, Min, Max, ValidateNested, IsBoolean, IsString, MaxLength, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class IncomingMessageDto {
  @ApiProperty({ description: 'Whether message is from user', example: false })
  @IsBoolean()
  from_me: boolean;

  @ApiProperty({ description: 'Message text', example: 'Hey, can you send over the report by today?', maxLength: 2000 })
  @IsString()
  @MaxLength(2000)
  text: string;

  @ApiProperty({ description: 'Message timestamp', example: '2025-11-25T16:30:00Z' })
  @IsString()
  timestamp: string;
}

class StyleOverrideDto {
  @ApiProperty({ description: 'Tone override', example: 'formal', enum: ['casual', 'neutral', 'formal'], required: false })
  @IsOptional()
  @IsString()
  tone?: string;

  @ApiProperty({ description: 'Emoji level override', example: 'low', enum: ['none', 'low', 'normal', 'high'], required: false })
  @IsOptional()
  @IsString()
  emoji_level?: string;

  @ApiProperty({ description: 'Length preference override', example: 'short', enum: ['short', 'medium', 'long'], required: false })
  @IsOptional()
  @IsString()
  length_pref?: string;
}

export class GenerateMessageDto {
  @ApiProperty({ 
    description: 'Incoming messages context', 
    type: [IncomingMessageDto],
    maxItems: 20 
  })
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => IncomingMessageDto)
  incoming_messages: IncomingMessageDto[];

  @ApiProperty({ 
    description: 'Style override for this generation', 
    type: StyleOverrideDto,
    required: false 
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => StyleOverrideDto)
  style_override?: StyleOverrideDto;

  @ApiProperty({ 
    description: 'Number of suggestions to generate', 
    example: 3,
    minimum: 1,
    maximum: 4,
    required: false 
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  n_suggestions?: number;
}

