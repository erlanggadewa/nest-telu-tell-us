import { Injectable } from '@nestjs/common';
import { appConfig } from 'src/config/config';
import { parseBoolean, removeNewlines } from 'src/utils/string';
import { AzureService } from '../azure/azure.service';
import { OpenAiService } from '../openai/openai.service';
import { ApproachContext } from './cognitive-search.interface';
export interface SearchDocumentsResult {
  query: string;
  results: string[];
  content: string;
  citationId: string[];
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
    query?: string,
    context: ApproachContext = {},
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
    const citationId: string[] = [];
    if (useSemanticCaption) {
      for await (const result of searchResults.results) {
        // TODO: ensure typings
        const document = result as any;
        const captions = document['@search.captions'];
        const captionsText = captions?.map((c: any) => c.text).join(' . ');
        results.push(
          `${document[this.sourcePageField]}: ${removeNewlines(captionsText)}`,
        );
        citationId.push(document['id']);
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
        citationId.push(document['id']);
      }
    }
    const content = results.join('\n');
    return {
      query: queryText ?? '',
      results,
      content,
      citationId,
    };
  }
}
