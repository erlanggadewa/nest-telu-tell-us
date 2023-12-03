import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import {
  BodyChatMessageByCitationIdDto,
  BodyChatMessageDto,
  BodyCreateHistoryDto,
} from './dto/chat.dto';

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
      citationSource,
    } = await this.chatService.createChat(messages, req.context);

    return { bodyGenerateMsg, dataPoints, citationSource };
  }

  @Post('/citation')
  async createMessageByCitationId(@Body() req: BodyChatMessageByCitationIdDto) {
    const { messages } = req;

    const {
      bodyGenerateMsg,
      results: dataPoints,
      citationSource,
    } = await this.chatService.createChat(
      messages,
      req.context,
      req.citationId,
    );

    return { bodyGenerateMsg, dataPoints, citationSource };
  }

  @Post('/history')
  async createHistory(@Body() req: BodyCreateHistoryDto) {
    return 'method not implemented';
  }

  @Post('/catalog')
  async createMessageCatalog(@Body() req: BodyChatMessageDto) {
    const { messages } = req;

    return await this.chatService.createMessageCatalog(messages, req.context);
  }
}
