import { Module } from '@nestjs/common';
import { AzureModule } from '../azure/azure.module';
import { OpenAiModule } from '../openai/openai.module';
import { CognitiveSearchController } from './cognitive-search.controller';
import { CognitiveSearchService } from './cognitive-search.service';

@Module({
  controllers: [CognitiveSearchController],
  providers: [CognitiveSearchService],
  imports: [AzureModule, OpenAiModule],
  exports: [CognitiveSearchService],
})
export class CognitiveSearchModule {}
