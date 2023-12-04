import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { BodyGetCatalogDto } from './dto/get-catalog.dto';

@ApiTags('catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Post('/homepage')
  getCatalogOpenlib(@Body() body: BodyGetCatalogDto) {
    return this.catalogService.getCatalogOpenlib(body.query, body.context);
  }
}
