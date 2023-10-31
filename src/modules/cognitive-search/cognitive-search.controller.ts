import { Controller } from '@nestjs/common';
import { CognitiveSearchService } from './cognitive-search.service';

@Controller('cognitive-search')
export class CognitiveSearchController {
  constructor(private readonly cognitiveSearchService: CognitiveSearchService) {}
}
