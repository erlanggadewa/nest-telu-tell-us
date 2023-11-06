import { Controller, Get, Param, Res, StreamableFile } from "@nestjs/common";
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { appConfig } from 'src/config/config';
import { BlobStorageService } from './blob-storage.service';

@ApiTags('blob-storage')
@Controller('blob-storage')
export class BlobStorageController {
  constructor(private readonly blobStorageService: BlobStorageService) {}

  @Get(':filename')
  async getContent(
    @Res({ passthrough: true }) res: Response,
    @Param('filename') filename: string,
  ) {
    const file = await this.blobStorageService.getContent(filename);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline`,
      'Content-Security-Policy': `frame-ancestors ${appConfig.feUrl}`,
    });

    return new StreamableFile(file);
  }
}
