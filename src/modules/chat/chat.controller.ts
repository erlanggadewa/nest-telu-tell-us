import { Body, Controller, Post, Response } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OpenAIStream, streamToResponse } from 'ai';
import { IncomingMessage, ServerResponse } from 'http';
import { ChatService } from './chat.service';
import { BodyChatMessageDto } from './dto/chat.dto';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post()
  async createMessage(
    @Body() req: BodyChatMessageDto,
    @Response() res: ServerResponse<IncomingMessage>,
  ) {
    const { messages } = req;

    const {
      finalMsg: responseMessage,
      results: dataPoints,
      citationId,
    } = await this.chatService.baseRun(messages, req.context);

    // Instantiate the StreamData. It works with all API providers.
    const stream = OpenAIStream(responseMessage, {
      onCompletion: (completion) => {},
    });

    return new streamToResponse(stream, res);
  }
}
