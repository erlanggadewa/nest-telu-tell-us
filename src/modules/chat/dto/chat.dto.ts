import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export type MessageRole = 'system' | 'user' | 'assistant' | 'function';

export class HistoryMessageDto {
  @ApiPropertyOptional()
  role: MessageRole;
  @ApiPropertyOptional()
  content: string;
}

export class ChatApproachContextDto {
  @ApiPropertyOptional({ default: true })
  suggest_followup_questions?: boolean;
  @ApiPropertyOptional({ default: true })
  semantic_ranker?: boolean;
  @ApiPropertyOptional({ default: 3 })
  top?: number;
  @ApiPropertyOptional({ default: 0.7 })
  temperature?: number;
  @ApiPropertyOptional({ default: null })
  exclude_category?: string;
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
      {
        role: 'assistant',
        content:
          'Sumber-sumber tugas akhir dapat berasal dari berbagai sumber, seperti:\n- Buku PA-16.pdf [4]: Sumber penelitian tugas akhir dapat berasal dari kebutuhan teknologi informasi di Universitas Telkom dan hasil riset dan inovasi di bidang teknologi informasi.\n- Buku PA - 6706201141 - Annisa Ayu Nurarifa-15.pdf [4]: Sumber-sumber tugas akhir dapat berasal dari kerja sama dengan institusi dan perusahaan lain dalam memberikan layanan pelatihan teknologi informasi.\n- Buku PA - 6706201141 - Annisa Ayu Nurarifa-28.pdf [4]: Sumber-sumber tugas akhir dapat berasal dari data dan informasi yang terdapat dalam dashboard sumber daya, karir, kompetensi, kualifikasi, dan sarana dan prasarana di Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi Republik Indonesia.\n\nNext Questions:\n1. Apa saja kebutuhan teknologi informasi di Universitas Telkom? [4]\n2. Apa saja portfolio pelatihan yang pernah dilakukan oleh PT Adi Data Utama? [4]\n3. Apa saja informasi yang terdapat dalam dashboard sumber daya, karir, kompetensi, kualifikasi, dan sarana dan prasarana di Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi Republik Indonesia? [4]',
      },
      {
        role: 'user',
        content: 'Berikan 3 contoh tugas akhir bertema teknologi',
      },
    ],
  })
  messages: HistoryMessageDto[];
}
