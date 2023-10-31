import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { appConfig } from 'src/config/config';

@Injectable()
export class OpenAiService {
  chatClient: OpenAI;
  embeddingsClient: OpenAI;

  constructor() {
    const openAiUrl = `https://${appConfig.azureOpenAiService}.openai.azure.com/`;
    const commonOptions = {
      apiKey: appConfig.azureOpenAiKey,
      defaultQuery: { 'api-version': appConfig.azureOpenAiApiVersion },
      defaultHeaders: { 'api-key': appConfig.azureOpenAiKey },
    };

    this.chatClient = new OpenAI({
      ...commonOptions,
      baseURL: `${openAiUrl}/openai/deployments/${appConfig.azureOpenAiChatGptDeployment}`,
    });

    this.embeddingsClient = new OpenAI({
      ...commonOptions,
      baseURL: `${openAiUrl}/openai/deployments/${appConfig.azureOpenAiEmbeddingDeployment}`,
    });
  }
  getChat() {
    return this.chatClient.chat;
  }
  getEmbeddings() {
    return this.embeddingsClient.embeddings;
  }
}
