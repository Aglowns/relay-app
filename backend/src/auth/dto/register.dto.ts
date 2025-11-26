import { IsEmail, IsString, MinLength, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class DeviceDto {
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
  model?: string;

  @ApiProperty({ description: 'OS version', example: '18.0', required: false })
  @IsString()
  os_version?: string;
}

export class RegisterDto {
  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password (min 8 characters)', example: 'SuperSecret123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ description: 'Device information', type: DeviceDto })
  @ValidateNested()
  @Type(() => DeviceDto)
  device: DeviceDto;
}

