import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export type MessageRole = 'system' | 'user' | 'assistant' | 'function';

export class HistoryMessageDto {
  @ApiPropertyOptional()
  role: MessageRole;
  @ApiPropertyOptional()
  content: string;
}

export class ChatByCitationIdApproachContextDto {
  @ApiPropertyOptional({ default: true })
  suggest_followup_questions?: boolean;
  @ApiPropertyOptional({ default: true })
  semantic_ranker?: boolean;
  @ApiPropertyOptional({ default: 0.7 })
  temperature?: number;
  @ApiPropertyOptional({
    enum: ['hybrid', 'text', 'vectors'],
    default: 'hybrid',
  })
  @IsEnum(['hybrid', 'text', 'vectors'])
  retrieval_mode?: 'hybrid' | 'text' | 'vectors';
  @ApiPropertyOptional({ default: false })
  semantic_captions?: boolean;
  @ApiPropertyOptional({ default: null })
  prompt_template?: string;
  @ApiPropertyOptional({ default: null })
  prompt_template_prefix?: string;
  @ApiPropertyOptional({ default: null })
  prompt_template_suffix?: string;
  @ApiPropertyOptional({ default: true })
  stream?: boolean;
}

export class ChatApproachContextDto extends ChatByCitationIdApproachContextDto {
  @ApiPropertyOptional({ default: 3 })
  top?: number;
  @ApiPropertyOptional({ example: 'medical' })
  exclude_category?: string;
}
export class BodyChatMessageDto {
  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id?: string;

  @ApiPropertyOptional()
  context?: ChatApproachContextDto;

  @ApiProperty({
    example: [
      {
        role: 'user',
        content: 'Darimana sumber-sumber tugas akhir berasal',
      },
    ],
  })
  @IsNotEmpty()
  messages: HistoryMessageDto[];
}

export class BodyChatMessageByCitationIdDto {
  @ApiProperty({
    description: 'Citation ID',
    example:
      'file-Implementasi_Node_js_dan_Microservices_dalam_Aplikasi_Registrasi_Mahasiswa_Baru_Telkom_University_pdf-496D706C656D656E74617369204E6F64652E6A732064616E204D6963726F73657276696365732064616C616D2041706C696B6173692052656769737472617369204D616861736973776120426172752054656C6B6F6D20556E69766572736974792E706466-page-17',
  })
  @IsNotEmpty()
  citationId: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id?: string;

  @ApiPropertyOptional()
  context?: ChatByCitationIdApproachContextDto;

  @ApiProperty({
    example: [
      {
        role: 'user',
        content: 'Apa itu microservices?',
      },
    ],
  })
  @IsNotEmpty()
  messages: HistoryMessageDto[];
}

export class BodyCreateHistoryDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  userId: string;

  @ApiProperty({})
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({})
  path?: string;
}
