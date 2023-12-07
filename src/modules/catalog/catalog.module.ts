import { Module } from '@nestjs/common';
import { AzureModule } from '../azure/azure.module';
import { CognitiveSearchModule } from '../cognitive-search/cognitive-search.module';
import { OpenAiModule } from '../openai/openai.module';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';

@Module({
  controllers: [CatalogController],
  providers: [CatalogService],
  imports: [CognitiveSearchModule, OpenAiModule, AzureModule],
})
export class CatalogModule {}
