import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class GetBlobFileDto {
  @IsNotEmpty()
  @ApiProperty({
    example:
      'Implementasi Node.js dan Microservices dalam Aplikasi Registrasi Mahasiswa Baru Telkom University-56.pdf',
  })
  filename: string;
}
