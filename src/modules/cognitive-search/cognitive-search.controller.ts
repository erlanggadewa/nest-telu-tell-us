import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CognitiveSearchService } from './cognitive-search.service';
import { SummaryDto } from './dto/summary.dto';

@ApiTags('cognitive-search')
@Controller('cognitive-search')
export class CognitiveSearchController {
  constructor(
    private readonly cognitiveSearchService: CognitiveSearchService,
  ) {}

  @Post('/summary')
  async getSummaryByCitationId(@Body() body: SummaryDto) {
    const summary = await this.cognitiveSearchService.getSummaryByCitationId(
      body.citationId,
    );
    return summary.choices[0].message.content;
  }
}
