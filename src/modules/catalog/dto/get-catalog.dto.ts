import { ApiPropertyOptional } from '@nestjs/swagger';
import { ChatApproachContextDto } from 'src/modules/chat/dto/chat.dto';

export class BodyGetCatalogDto {
  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id?: string;

  @ApiPropertyOptional({
    example: 'artikel atau buku microservices',
  })
  query?: string;

  @ApiPropertyOptional()
  context?: ChatApproachContextDto;
}
