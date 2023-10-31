import { AzureKeyCredential, SearchClient } from '@azure/search-documents';
import {
  BlobServiceClient,
  ContainerClient,
  StorageSharedKeyCredential,
} from '@azure/storage-blob';
import { Injectable } from '@nestjs/common';
import { appConfig } from 'src/config/config';

@Injectable()
export class AzureService {
  searchIndex: SearchClient<any>;
  blobContainer: ContainerClient;
  constructor() {
    // Use the current user identity to authenticate with Azure OpenAI, Cognitive Search and Blob Storage
    // (no secrets needed, just use 'az login' locally, and managed identity when deployed on Azure).
    // If you need to use keys, use separate AzureKeyCredential instances with the keys for each service
    // const defaultAzureCredential = new DefaultAzureCredential();
    const azureCognitiveKey = new AzureKeyCredential(
      appConfig.azureCognitiveKey,
    );
    const azureBlobServiceKey = new StorageSharedKeyCredential(
      appConfig.azureStorageAccount,
      appConfig.azureStorageKey,
    );
    // Set up Azure clients
    this.searchIndex = new SearchClient<any>(
      `https://${appConfig.azureSearchService}.search.windows.net`,
      appConfig.azureSearchIndex,
      azureCognitiveKey,
    );

    const blobServiceClient = new BlobServiceClient(
      `https://${appConfig.azureStorageAccount}.blob.core.windows.net`,
      azureBlobServiceKey,
    );
    this.blobContainer = blobServiceClient.getContainerClient(
      appConfig.azureStorageContainer,
    );
  }
}
