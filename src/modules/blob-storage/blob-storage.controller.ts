import {
  Controller,
  Get,
  Param,
  Req,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { BlobStorageService } from './blob-storage.service';
import { GetBlobFileDto } from './dto/blob-storage.dto';

@ApiTags('blob-storage')
@Controller('blob-storage')
export class BlobStorageController {
  constructor(private readonly blobStorageService: BlobStorageService) {}

  @Get('/:filename')
  async getContent(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Param() query: GetBlobFileDto,
  ) {
    const file = await this.blobStorageService.getContent(query.filename);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename=${query.filename}`,
      'Content-Security-Policy': `frame-ancestors ${req.protocol}://${req.get(
        'Host',
      )}`,
    });

    return new StreamableFile(file);
  }
}
