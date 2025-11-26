import { Controller, Post, UseGuards, Request, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { GenerateMessageDto } from './dto/generate-message.dto';

@ApiTags('messages')
@Controller('v1/messages')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('JWT-auth')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate message suggestions' })
  @ApiBody({ type: GenerateMessageDto })
  @ApiResponse({
    status: 200,
    description: 'Suggestions generated successfully',
    schema: {
      type: 'object',
      properties: {
        suggestions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 's1' },
              text: { type: 'string', example: 'Sure! I\'ll send the report over before the end of the day.' },
              tone: { type: 'string', example: 'formal' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 403, description: 'Subscription expired' })
  @ApiResponse({ status: 429, description: 'Daily usage limit exceeded' })
  async generate(@Request() req, @Body() generateDto: GenerateMessageDto) {
    return this.messagesService.generate(req.user.id, generateDto);
  }
}

