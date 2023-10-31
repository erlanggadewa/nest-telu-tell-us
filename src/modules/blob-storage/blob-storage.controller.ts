import { Controller, Get, Param, Res, StreamableFile } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { BlobStorageService } from './blob-storage.service';
import { GetBlobFileDto } from './dto/blob-storage.dto';

@ApiTags('blob-storage')
@Controller('blob-storage')
export class BlobStorageController {
  constructor(private readonly blobStorageService: BlobStorageService) {}

  @Get('/:filename')
  async getContent(
    @Res({ passthrough: true }) res: Response,
    @Param() query: GetBlobFileDto,
  ) {
    const file = await this.blobStorageService.getContent(query.filename);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=${query.filename}`,
    });
    return new StreamableFile(file);
  }
}
