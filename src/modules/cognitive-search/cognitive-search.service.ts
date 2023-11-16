import { BadRequestException, Injectable } from '@nestjs/common';
import { appConfig } from 'src/config/config';
import { parseBoolean, removeNewlines } from 'src/utils/string';
import { AzureService } from '../azure/azure.service';
import { OpenAiService } from '../openai/openai.service';
import {
  ApproachCreateChat,
  ApproachCreateChatByCitationId,
} from './cognitive-search.interface';
export interface SearchDocumentsResult {
  query: string;
  results: string[];
  content: string;
  citationSource: {
    citationId: string;
    sourcePage: string;
    sourceFile: string;
  }[];
}

@Injectable()
export class CognitiveSearchService {
  embeddingModel: string;
  sourcePageField: string;
  contentField: string;

  constructor(
    private searchService: AzureService,
    private openAiService: OpenAiService,
  ) {
    this.embeddingModel = appConfig.azureOpenAiEmbeddingModel;
    this.sourcePageField = appConfig.kbFieldsSourcePage;
    this.contentField = appConfig.kbFieldsContent;
  }

  async searchDocuments(
    context: ApproachCreateChat,
    query: string,
  ): Promise<SearchDocumentsResult> {
    const hasText = ['text', 'hybrid', undefined].includes(
      context?.retrieval_mode,
    );
    const hasVectors = ['vectors', 'hybrid', undefined].includes(
      context?.retrieval_mode,
    );
    const useSemanticCaption =
      parseBoolean(context?.semantic_captions) && hasText;
    const top = context?.top ? Number(context?.top) : 3;
    const excludeCategory: string | undefined = context?.exclude_category;
    const filter = excludeCategory
      ? `category ne '${excludeCategory.replace("'", "''")}'`
      : undefined;

    // If retrieval mode includes vectors, compute an embedding for the query
    let queryVector;
    if (hasVectors) {
      const openAiEmbeddings = await this.openAiService.getEmbeddings();

      const result = await openAiEmbeddings.create({
        model: this.embeddingModel,
        input: query!,
      });
      queryVector = result.data[0].embedding;
    }

    // Only keep the text query if the retrieval mode uses text, otherwise drop it
    const queryText = hasText ? query : '';

    // Use semantic L2 reranker if requested and if retrieval mode is text or hybrid (vectors + text)
    const searchResults = await (context?.semantic_ranker && hasText
      ? this.searchService.searchIndex.search(queryText, {
          filter,
          queryType: 'semantic',
          queryLanguage: 'en-us',
          speller: 'lexicon',
          semanticConfiguration: 'default',
          top,
          captions: useSemanticCaption
            ? 'extractive|highlight-false'
            : undefined,
          vectors: [
            {
              value: queryVector,
              kNearestNeighborsCount: queryVector ? 50 : undefined,
              fields: queryVector ? ['embedding'] : undefined,
            },
          ],
        })
      : this.searchService.searchIndex.search(queryText, {
          filter,
          top,
          vectors: [
            {
              value: queryVector,
              kNearestNeighborsCount: queryVector ? 50 : undefined,
              fields: queryVector ? ['embedding'] : undefined,
            },
          ],
        }));

    const results: string[] = [];
    const citationSource: SearchDocumentsResult['citationSource'] = [];

    if (useSemanticCaption) {
      for await (const result of searchResults.results) {
        // TODO: ensure typings
        const document = result as any;
        const captions = document['@search.captions'];
        const captionsText = captions?.map((c: any) => c.text).join(' . ');
        results.push(
          `${document[this.sourcePageField]}: ${removeNewlines(captionsText)}`,
        );
        console.log(document);

        citationSource.push({
          citationId: document['id'],
          sourcePage: document[this.sourcePageField],
          sourceFile: document['sourcefile'],
        });
      }
    } else {
      for await (const result of searchResults.results) {
        // TODO: ensure typings
        const document = result.document as any;
        results.push(
          `${document[this.sourcePageField]}: ${removeNewlines(
            document[this.contentField],
          )}`,
        );
        console.log(document);

        citationSource.push({
          citationId: document['id'],
          sourcePage: document[this.sourcePageField],
          sourceFile: document['sourcefile'],
        });
      }
    }
    const content = results.join('\n');
    return {
      query: queryText ?? '',
      results,
      content,
      citationSource,
    };
  }

  async searchDocumentByCitationId(
    context: ApproachCreateChatByCitationId,
    query: string,
    userCitationId: string,
  ): Promise<SearchDocumentsResult> {
    const hasText = ['text', 'hybrid', undefined].includes(
      context?.retrieval_mode,
    );
    const hasVectors = ['vectors', 'hybrid', undefined].includes(
      context?.retrieval_mode,
    );
    const useSemanticCaption =
      parseBoolean(context?.semantic_captions) && hasText;

    // If retrieval mode includes vectors, compute an embedding for the query
    let queryVector;
    if (hasVectors) {
      const openAiEmbeddings = await this.openAiService.getEmbeddings();

      const result = await openAiEmbeddings.create({
        model: this.embeddingModel,
        input: query!,
      });
      queryVector = result.data[0].embedding;
    }

    // Only keep the text query if the retrieval mode uses text, otherwise drop it
    const queryText = hasText ? query : '';

    // Use semantic L2 reranker if requested and if retrieval mode is text or hybrid (vectors + text)
    const searchResults = await this.searchService.searchIndex.getDocument(
      userCitationId,
      {
        onResponse: (response) => {
          if (response.status === 404)
            throw new BadRequestException('Citation ID not found');
        },
      },
    );

    const results: string[] = [];
    const citationSource: SearchDocumentsResult['citationSource'] = [];

    if (useSemanticCaption) {
      // TODO: ensure typings
      const document = searchResults;
      const captions = document['@search.captions'];
      const captionsText = captions?.map((c: any) => c.text).join(' . ');
      results.push(
        `${document[this.sourcePageField]}: ${removeNewlines(captionsText)}`,
      );
      citationSource.push({
        citationId: document['id'],
        sourcePage: document[this.sourcePageField],
        sourceFile: document['sourcefile'],
      });
    } else {
      // TODO: ensure typings
      const document = searchResults;
      results.push(
        `${document[this.sourcePageField]}: ${removeNewlines(
          document[this.contentField],
        )}`,
      );
      citationSource.push({
        citationId: document['id'],
        sourcePage: document[this.sourcePageField],
        sourceFile: document['sourcefile'],
      });
    }

    const content = results.join('\n');
    return {
      query: queryText ?? '',
      results,
      content,
      citationSource,
    };
  }
}
