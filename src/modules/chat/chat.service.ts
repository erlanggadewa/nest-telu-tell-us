import { Injectable } from '@nestjs/common';
import { ChatCompletionMessageParam } from 'openai/resources';
import { appConfig } from 'src/config/config';
import {
  CognitiveSearchService,
  ISearchDocumentsResult,
} from '../cognitive-search/cognitive-search.service';
import { OpenAiService } from '../openai/openai.service';
import { ChatApproachContextDto, HistoryMessageDto } from './dto/chat.dto';

const SYSTEM_MESSAGE_CHAT_CONVERSATION = `Assistant helps the Telkom University with support questions regarding terms of service, privacy policy, and questions about support requests. Be brief in your answers.
Answer ONLY with the facts listed in the list of sources below. If there isn't enough information below, say you don't know and don't provide any sources. Do not generate answers that don't use the sources below. If asking a clarifying question to the user would help, ask the question.
For tabular information return it as an html table. Do not return markdown format. Answer in the language used in the last question.
Each source has a name followed by colon and the actual information, always include the source name for each fact you use in the response. Use square brackets to reference the source, e.g. [info1.txt]. Don't combine sources, list each source separately, e.g. [info1.txt][info2.pdf].
{follow_up_questions_prompt}
{injected_prompt}
`;

const FOLLOW_UP_QUESTIONS_PROMPT_CONTENT = `Generate 3 very brief follow-up questions that the user would likely ask next.
Enclose the follow-up questions in double angle brackets. Example:
<<Am I allowed to invite friends for a party?>>
<<How can I ask for a refund?>>
<<What If I break something?>>

Do no repeat questions that have already been asked.
Make sure the last question ends with ">>".`;

const QUERY_PROMPT_TEMPLATE = `Below is a history of the conversation so far, and a new question asked by the user that needs to be answered by searching in a knowledge base about terms of service, privacy policy, and questions about support requests.
Generate a search query based on the conversation and the new question.
Do not include cited source filenames and document names e.g info.txt or doc.pdf in the search query terms.
Do not include any text inside [] or <<>> in the search query terms.
Do not include any special characters like '+'.
If the question is not in English, translate the question to English before generating the search query.
If you cannot generate a search query, return just the number 0.
`;

const QUERY_PROMPT_TEMPLATE_CATALOG = `Below is a history of the conversation so far, and a new question asked by the user that needs to be answered by searching in a knowledge base about terms of service, privacy policy, and questions about support requests.
Generate a search key query for cognitive search based on the conversation and the new question.
Do not include cited source filenames and document names e.g info.txt or doc.pdf in the search query terms.
Do not include any text inside [] or <<>> in the search query terms.
Do not include any special characters like '+'.
If the question is not in English, translate the question to English before generating the search query.
If you cannot generate a search query, return just the number 0.
`;

const SYSTEM_MESSAGE_CHAT_CONVERSATION_CATALOG = `Assistant helps the Telkom University with support questions regarding terms of service, privacy policy, and questions about support requests. Be brief in your answers.
Answer ONLY with the facts listed in the list of sources below. If there isn't enough information below, say you don't know and don't provide any sources. Do not generate answers that don't use the sources below. If asking a clarifying question to the user would help, ask the question.
For tabular information return it as an html table. Do not return markdown format. Answer in the language used in the last question.
Each source has a name followed by colon and the actual information. Use square brackets to reference the source, e.g. [info1.txt]. Don't combine sources, list each source separately, e.g. [info1.txt][info2.pdf].

Please provide answer and return data subject from the subjek, catalog type from jeniskatalog, title from judul, author from author, publication year from tahunterbit, publisher name from publisher_name, location from lokasi, link from link. List each separately and you must answer in the language used in the last question.


{injected_prompt}
`;

const QUERY_PROMPT_FEW_SHOTS: HistoryMessageDto[] = [
  { role: 'user', content: 'What happens if a payment error occurs?' },
  { role: 'assistant', content: 'Show support for payment errors' },
  { role: 'user', content: 'can I get refunded if cannot travel?' },
  { role: 'assistant', content: 'Refund policy' },
];

const QUERY_PROMPT_FEW_SHOTS_CATALOG: HistoryMessageDto[] = [
  {
    role: 'user',
    content: 'Berikan saya rekomedasi artikel tentang microservice?',
  },
  {
    role: 'assistant',
    content: `[
        {
          Judul: Service-Oriented Architecture: Analysis and Design for Services and Microservices, Second Edition,
          Penulis: Thomas Erl,
          Penerbit: Pearson,
          Lokasi: TelU - Gedung Manterawu Lantai 5,
          Resume : Berisi materi mengenai microservice dan juga hasil analisanya,
          Link: [Service-Oriented Architecture: Analysis and Design for Services and Microservices, Second Edition](https://openlibrary.telkomuniversity.ac.id/home/catalog/id/197570/service-oriented-architecture-analysis-and-design-for-services-and-microservices-second-edition.html)
        },
        {
          Judul: Monolith to Microservices: Evolutionary Patterns to Transform Your Monolith,
          Penulis: Sam Newman,
          Penerbit: O'Reilly Media,
          Lokasi: TelU - Gedung Manterawu Lantai 5,
          Resume : Bercerita mengenai evolusi desain arsitektur dari monolith hingga menjadi microservice,
          Link: [Monolith to Microservices: Evolutionary Patterns to Transform Your Monolith](https://openlibrary.telkomuniversity.ac.id/home/catalog/id/160539/monolith-to-microservices-evolutionary-patterns-to-transform-your-monolith.html)
        }
      ]
      `,
  },
];

@Injectable()
export class ChatService {
  constructor(
    private searchService: CognitiveSearchService,
    private openAiService: OpenAiService,
  ) {}
  async createChat(
    history: HistoryMessageDto[],
    context: ChatApproachContextDto = {},
    userCitationId?: string[],
  ) {
    const userQuery =
      'Generate search query for: ' + history[history.length - 1].content;

    // STEP 1: Generate an optimized keyword search query based on the chat history and the last question
    // -----------------------------------------------------------------------

    const messages = this.getMessageHistory(history.slice(0, -1), userQuery);

    // translate query to english with match context
    const chatCompletion =
      await this.openAiService.chatClient.chat.completions.create({
        model: appConfig.azureOpenAiChatGptModel,
        messages,
        temperature: 0,
        max_tokens: 100,
        n: 1,
      });

    let queryText = chatCompletion.choices[0].message.content?.trim();

    if (queryText === '0') {
      // Use the last user input if we failed to generate a better query
      queryText = history[history.length - 1].content;
    }

    // STEP 2: Retrieve relevant documents from the search index with the GPT optimized query
    // -----------------------------------------------------------------------
    let searchDocumentsResult: ISearchDocumentsResult;

    if (userCitationId) {
      searchDocumentsResult =
        await this.searchService.searchDocumentByCitationId(
          context,
          queryText,
          userCitationId,
        );
    } else {
      searchDocumentsResult = await this.searchService.searchDocuments(
        context,
        queryText,
      );
    }

    const { query, results, content, citationSource } = searchDocumentsResult;

    const followUpQuestionsPrompt = context?.suggest_followup_questions
      ? FOLLOW_UP_QUESTIONS_PROMPT_CONTENT
      : '';

    // STEP 3: Generate a contextual and content specific answer using the search results and chat history
    // -----------------------------------------------------------------------
    // Allow client to replace the entire prompt, or to inject into the exiting prompt using >>>

    const promptOverride = context?.prompt_template;
    let systemMessage: string;
    if (promptOverride?.startsWith('>>>')) {
      systemMessage = SYSTEM_MESSAGE_CHAT_CONVERSATION.replace(
        '{follow_up_questions_prompt}',
        followUpQuestionsPrompt,
      ).replace('{injected_prompt}', promptOverride.slice(3) + '\n');
    } else if (promptOverride) {
      systemMessage = SYSTEM_MESSAGE_CHAT_CONVERSATION.replace(
        '{follow_up_questions_prompt}',
        followUpQuestionsPrompt,
      ).replace('{injected_prompt}', promptOverride);
    } else {
      systemMessage = SYSTEM_MESSAGE_CHAT_CONVERSATION.replace(
        '{follow_up_questions_prompt}',
        followUpQuestionsPrompt,
      ).replace('{injected_prompt}', '');
    }

    const msgForGenerateAnswer = this.getMessageHistoryGenerateAnswer(
      systemMessage,
      history.slice(0, -1),
      history[history.length - 1].content,
      content,
    );

    const bodyGenerateMsg = {
      model: appConfig.azureOpenAiChatGptModel,
      messages: msgForGenerateAnswer,
      temperature: Number(context?.temperature ?? 0.7),
      n: 1,
      stream: context.stream ?? true,
    };

    return { bodyGenerateMsg, results, citationSource };
  }

  protected getMessageHistory(
    history: HistoryMessageDto[],
    userQuery: string,
  ): ChatCompletionMessageParam[] {
    return [
      { role: 'system', content: QUERY_PROMPT_TEMPLATE },
      ...QUERY_PROMPT_FEW_SHOTS,
      ...history,
      { role: 'user', content: userQuery },
    ];
  }

  protected getMessageHistoryCatalog(
    history: HistoryMessageDto[],
    userQuery: string,
  ): ChatCompletionMessageParam[] {
    return [
      {
        role: 'system',
        content: QUERY_PROMPT_TEMPLATE_CATALOG,
      },
      ...QUERY_PROMPT_FEW_SHOTS_CATALOG,
      ...history,
      { role: 'user', content: userQuery },
    ];
  }

  protected getMessageHistoryGenerateAnswer(
    systemMessage: string,
    history: HistoryMessageDto[],
    lastUserQuestion: string,
    content: string,
  ): ChatCompletionMessageParam[] {
    return [
      { role: 'system', content: systemMessage },
      ...history,
      { role: 'user', content: `${lastUserQuestion}\n\nSources:\n${content}` },
    ];
  }

  protected getMessageHistoryGenerateAnswerCatalog(
    systemMessage: string,
    history: HistoryMessageDto[],
    lastUserQuestion: string,
    content: string,
  ): ChatCompletionMessageParam[] {
    return [
      {
        role: 'system',
        content: systemMessage,
      },
      ...history,
      { role: 'user', content: `${lastUserQuestion}\n\nSources:\n${content}` },
    ];
  }

  async createMessageCatalog(
    history: HistoryMessageDto[],
    context: ChatApproachContextDto = {},
  ) {
    const userQuery =
      'Generate search query for: ' + history[history.length - 1].content;

    // STEP 1: Generate an optimized keyword search query based on the chat history and the last question
    // -----------------------------------------------------------------------

    const messages = this.getMessageHistoryCatalog(
      history.slice(0, -1),
      userQuery,
    );

    // translate query to english with match context
    const chatCompletion =
      await this.openAiService.chatClient.chat.completions.create({
        model: appConfig.azureOpenAiChatGptModel,
        messages,
        temperature: 0,
        max_tokens: 100,
        n: 1,
      });

    let queryText = chatCompletion.choices[0].message.content?.trim();

    if (queryText === '0') {
      // Use the last user input if we failed to generate a better query
      queryText = history[history.length - 1].content;
    }

    // STEP 2: Retrieve relevant documents from the search index with the GPT optimized query
    // -----------------------------------------------------------------------
    let searchCatalogResult = await this.searchService.searchCatalog(
      context,
      queryText,
    );

    const { query, results, content } = searchCatalogResult;

    context.suggest_followup_questions = true;

    const followUpQuestionsPrompt = context?.suggest_followup_questions
      ? FOLLOW_UP_QUESTIONS_PROMPT_CONTENT
      : '';

    // STEP 3: Generate a contextual and content specific answer using the search results and chat history
    // -----------------------------------------------------------------------
    // Allow client to replace the entire prompt, or to inject into the exiting prompt using >>>

    const promptOverride = context?.prompt_template;
    let systemMessage: string;
    if (promptOverride?.startsWith('>>>')) {
      systemMessage = SYSTEM_MESSAGE_CHAT_CONVERSATION_CATALOG.replace(
        '{follow_up_questions_prompt}',
        followUpQuestionsPrompt,
      ).replace('{injected_prompt}', promptOverride.slice(3) + '\n');
    } else if (promptOverride) {
      systemMessage = SYSTEM_MESSAGE_CHAT_CONVERSATION_CATALOG.replace(
        '{follow_up_questions_prompt}',
        followUpQuestionsPrompt,
      ).replace('{injected_prompt}', promptOverride);
    } else {
      systemMessage = SYSTEM_MESSAGE_CHAT_CONVERSATION_CATALOG.replace(
        '{follow_up_questions_prompt}',
        followUpQuestionsPrompt,
      ).replace('{injected_prompt}', '');
    }

    const msgForGenerateAnswer = this.getMessageHistoryGenerateAnswerCatalog(
      systemMessage,
      history.slice(0, -1),
      history[history.length - 1].content,
      content,
    );

    const bodyGenerateMsg = {
      model: appConfig.azureOpenAiChatGptModel,
      messages: msgForGenerateAnswer,
      temperature: Number(context?.temperature ?? 0.7),
      n: 1,
      stream: context.stream ?? true,
    };

    return bodyGenerateMsg;
  }
}
