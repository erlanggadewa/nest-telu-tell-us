import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { BodyChatMessageDto } from './dto/chat.dto';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post()
  async createMessage(@Body() req: BodyChatMessageDto) {
    const { messages } = req;

    const {
      bodyGenerateMsg,
      results: dataPoints,
      citationIds,
    } = await this.chatService.baseRun(messages, req.context);

    return { bodyGenerateMsg, dataPoints, citationIds };
  }

  @Post('/history')
  async createHistory() {}
}
