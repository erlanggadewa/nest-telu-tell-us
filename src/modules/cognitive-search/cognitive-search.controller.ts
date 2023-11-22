import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CognitiveSearchService } from './cognitive-search.service';

@ApiTags('cognitive-search')
@Controller('cognitive-search')
export class CognitiveSearchController {
  constructor(
    private readonly cognitiveSearchService: CognitiveSearchService,
  ) {}

  @Get('/summary/:citationId')
  async getSummaryByCitationId(@Param('citationId') citationId: string) {
    const summary =
      await this.cognitiveSearchService.getSummaryByCitationId(citationId);
    return summary.choices[0].message.content;
  }
}
