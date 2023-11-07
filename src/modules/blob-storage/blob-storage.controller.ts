import { Body, Controller, Post, Res, StreamableFile } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { appConfig } from 'src/config/config';
import { BlobStorageService } from './blob-storage.service';
import { GetBlobFileDto } from './dto/blob-storage.dto';

@ApiTags('blob-storage')
@Controller('blob-storage')
export class BlobStorageController {
  constructor(private readonly blobStorageService: BlobStorageService) {}

  @Post()
  async getContent(
    @Res({ passthrough: true }) res: Response,
    @Body() query: GetBlobFileDto,
  ) {
    const file = await this.blobStorageService.getContent(query.filename);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline`,
      'Content-Security-Policy': `frame-ancestors ${appConfig.feUrl}`,
    });

    return new StreamableFile(file);
  }
}
