import { Module } from '@nestjs/common';
import { AzureModule } from '../azure/azure.module';
import { BlobStorageController } from './blob-storage.controller';
import { BlobStorageService } from './blob-storage.service';

@Module({
  controllers: [BlobStorageController],
  providers: [BlobStorageService],
  imports: [AzureModule],
})
export class BlobStorageModule {}
