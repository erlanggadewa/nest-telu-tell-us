require('dotenv').config();
import * as Joi from 'joi';

export interface AppConfig {
  appName: string;
  azureStorageAccount: string;
  azureStorageContainer: string;
  azureStorageKey: string;
  azureSearchService: string;
  azureSearchIndex: string;
  azureOpenAiService: string;
  azureOpenAiChatGptDeployment: string;
  azureOpenAiChatGptModel: string;
  azureOpenAiEmbeddingDeployment: string;
  azureOpenAiEmbeddingModel: string;
  kbFieldsContent: string;
  kbFieldsSourcePage: string;
  allowedOrigins: string;
  azureOpenAiKey: string;
  azureCognitiveKey: string;
  azureOpenAiApiVersion: string;
  feUrl: string;
}

export const appConfig: AppConfig = {
  azureStorageAccount: process.env.AZURE_STORAGE_ACCOUNT || '',
  azureStorageContainer: process.env.AZURE_STORAGE_CONTAINER || '',
  azureStorageKey: process.env.AZURE_STORAGE_KEY || '',
  azureSearchService: process.env.AZURE_SEARCH_SERVICE || '',
  azureSearchIndex: process.env.AZURE_SEARCH_INDEX || '',
  azureOpenAiService: process.env.AZURE_OPENAI_SERVICE || '',
  azureOpenAiChatGptDeployment:
    process.env.AZURE_OPENAI_CHATGPT_DEPLOYMENT || '',
  azureOpenAiChatGptModel:
    process.env.AZURE_OPENAI_CHATGPT_MODEL || 'gpt-35-turbo',
  azureOpenAiEmbeddingDeployment:
    process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT || '',
  azureOpenAiEmbeddingModel:
    process.env.AZURE_OPENAI_EMBEDDING_MODEL || 'text-embedding-ada-002',
  kbFieldsContent: process.env.KB_FIELDS_CONTENT || 'content',
  kbFieldsSourcePage: process.env.KB_FIELDS_SOURCEPAGE || 'sourcepage',
  allowedOrigins: process.env.ALLOWED_ORIGINS || '*',
  azureOpenAiKey: process.env.AZURE_OPENAI_API_KEY || '',
  azureCognitiveKey: process.env.AZURE_COGNITIF_API_KEY || '',
  azureOpenAiApiVersion: process.env.AZURE_OPENAI_API_VERSION || '2023-05-15',
  appName: process.env.APP_NAME || '',
  feUrl: process.env.FE_URL || '',
};

export const appConfigValidationSchema = Joi.object({
  AZURE_STORAGE_ACCOUNT: Joi.string().required(),
  AZURE_STORAGE_CONTAINER: Joi.string().required(),
  AZURE_STORAGE_KEY: Joi.string().required(),
  AZURE_SEARCH_SERVICE: Joi.string().required(),
  AZURE_SEARCH_INDEX: Joi.string().required(),
  AZURE_OPENAI_SERVICE: Joi.string().required(),
  AZURE_OPENAI_CHATGPT_DEPLOYMENT: Joi.string().required(),
  AZURE_OPENAI_CHATGPT_MODEL: Joi.string().required(),
  AZURE_OPENAI_EMBEDDING_DEPLOYMENT: Joi.string().required(),
  AZURE_OPENAI_EMBEDDING_MODEL: Joi.string().required(),
  KB_FIELDS_CONTENT: Joi.string().required(),
  KB_FIELDS_SOURCEPAGE: Joi.string().required(),
  ALLOWED_ORIGINS: Joi.string().required(),
  AZURE_OPENAI_API_KEY: Joi.string().required(),
  AZURE_COGNITIF_API_KEY: Joi.string().required(),
  AZURE_OPENAI_API_VERSION: Joi.string().required(),
  FE_URL: Joi.string().required(),
  APP_NAME: Joi.string().required(),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'provision')
    .default('development'),
  PORT: Joi.number().default(3000),

  // Global Prefix
  PREFIX_NAME: Joi.string().required(),

  // Database
  DATABASE_URL: Joi.string().required(),

  JWT_KEY: Joi.string().required(),
});
