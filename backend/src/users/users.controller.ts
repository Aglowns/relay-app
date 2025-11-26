import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('v1/me')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
        email: { type: 'string', example: 'user@example.com' },
        plan: { type: 'string', example: 'free' },
        createdAt: { type: 'string', example: '2025-01-25T10:00:00.000Z' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.id);
  }
}

