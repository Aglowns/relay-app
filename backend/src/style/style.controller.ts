import { Controller, Get, Put, UseGuards, Request, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { StyleService } from './style.service';
import { UpdateStyleDto } from './dto/update-style.dto';

@ApiTags('style')
@Controller('v1/me/style')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('JWT-auth')
export class StyleController {
  constructor(private readonly styleService: StyleService) {}

  @Get()
  @ApiOperation({ summary: 'Get user style settings' })
  @ApiResponse({
    status: 200,
    description: 'Style settings retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        tone: { type: 'string', example: 'casual' },
        emoji_level: { type: 'string', example: 'normal' },
        length_pref: { type: 'string', example: 'short' },
        profanity_ok: { type: 'boolean', example: false },
      },
    },
  })
  async getStyle(@Request() req) {
    return this.styleService.getStyle(req.user.id);
  }

  @Put()
  @ApiOperation({ summary: 'Update user style settings' })
  @ApiBody({ type: UpdateStyleDto })
  @ApiResponse({
    status: 200,
    description: 'Style settings updated successfully',
    schema: {
      type: 'object',
      properties: {
        tone: { type: 'string', example: 'neutral' },
        emoji_level: { type: 'string', example: 'low' },
        length_pref: { type: 'string', example: 'medium' },
        profanity_ok: { type: 'boolean', example: false },
      },
    },
  })
  async updateStyle(@Request() req, @Body() updateStyleDto: UpdateStyleDto) {
    return this.styleService.updateStyle(req.user.id, updateStyleDto);
  }
}

