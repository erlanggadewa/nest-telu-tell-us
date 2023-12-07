import { Injectable } from '@nestjs/common';
import { ChatApproachContextDto } from '../chat/dto/chat.dto';
import { CognitiveSearchService } from '../cognitive-search/cognitive-search.service';
import { OpenAiService } from '../openai/openai.service';

@Injectable()
export class CatalogService {
  constructor(
    private searchService: CognitiveSearchService,
    private openAiService: OpenAiService,
  ) {}

  async getCatalogOpenlib(query: string, context: ChatApproachContextDto = {}) {
    if (!query) query = '';
    const { results } = await this.searchService.searchCatalog(context, query);

    return results;
  }
}
