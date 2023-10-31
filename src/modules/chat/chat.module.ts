import { Module } from '@nestjs/common';
import { AzureModule } from '../azure/azure.module';
import { CognitiveSearchModule } from '../cognitive-search/cognitive-search.module';
import { OpenAiModule } from '../openai/openai.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService],
  imports: [CognitiveSearchModule, OpenAiModule, AzureModule],
  exports: [ChatService],
})
export class ChatModule {}
