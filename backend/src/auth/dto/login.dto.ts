import { IsEmail, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { DeviceDto } from './register.dto';

export class LoginDto {
  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password', example: 'SuperSecret123' })
  @IsString()
  password: string;

  @ApiProperty({ description: 'Device information', type: DeviceDto })
  @ValidateNested()
  @Type(() => DeviceDto)
  device: DeviceDto;
}

