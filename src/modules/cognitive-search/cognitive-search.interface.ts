export type ApproachCreateChat = {
  retrieval_mode?: 'hybrid' | 'text' | 'vectors';
  semantic_ranker?: boolean;
  semantic_captions?: boolean;
  top?: number;
  temperature?: number;
  prompt_template?: string;
  prompt_template_prefix?: string;
  prompt_template_suffix?: string;
  exclude_category?: string;
};
export type ApproachCreateChatByCitationId = {
  retrieval_mode?: 'hybrid' | 'text' | 'vectors';
  semantic_ranker?: boolean;
  semantic_captions?: boolean;
  temperature?: number;
  prompt_template?: string;
  prompt_template_prefix?: string;
  prompt_template_suffix?: string;
};
