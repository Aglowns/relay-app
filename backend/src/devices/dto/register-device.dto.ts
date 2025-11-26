import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDeviceDto {
  @ApiProperty({ description: 'Device ID from iOS', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsString()
  @IsNotEmpty()
  device_id: string;

  @ApiProperty({ description: 'Platform', example: 'ios' })
  @IsString()
  @IsNotEmpty()
  platform: string;

  @ApiProperty({ description: 'Device model', example: 'iPhone 15', required: false })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiProperty({ description: 'OS version', example: '18.0', required: false })
  @IsString()
  @IsOptional()
  os_version?: string;
}

