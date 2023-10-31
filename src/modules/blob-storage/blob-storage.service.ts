import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AzureService } from '../azure/azure.service';

@Injectable()
export class BlobStorageService {
  constructor(private blobService: AzureService) {}
  private readonly logger = new Logger(BlobStorageService.name);
  async getContent(filename: string) {
    try {
      const blobClient =
        await this.blobService.blobContainer.getBlobClient(filename);

      const exists = await blobClient.exists();
      if (!exists) {
        throw new NotFoundException('Blob not found');
      }
      const properties = await blobClient.getProperties();
      if (!properties?.contentType) {
        throw new NotFoundException('content type not found');
      }
      const buffer = await blobClient.downloadToBuffer();
      return buffer;
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        this.logger.error(
          '🚀 ~ file: blob-storage.service.ts:32 ~ BlobStorageService ~ getContent ~ error:',
          error,
        );
      }
      throw error;
    }
  }
}
