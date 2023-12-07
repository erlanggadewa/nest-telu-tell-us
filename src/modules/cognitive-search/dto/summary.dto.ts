import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class SummaryDto {
  @IsArray()
  @IsNotEmpty()
  @ApiProperty({
    example: [
      'file-Implementasi_Node_js_dan_Microservices_dalam_Aplikasi_Registrasi_Mahasiswa_Baru_Telkom_University_pdf-496D706C656D656E74617369204E6F64652E6A732064616E204D6963726F73657276696365732064616C616D2041706C696B6173692052656769737472617369204D616861736973776120426172752054656C6B6F6D20556E69766572736974792E706466-page-17',
      'file-Implementasi_Node_js_dan_Microservices_dalam_Aplikasi_Registrasi_Mahasiswa_Baru_Telkom_University_pdf-496D706C656D656E74617369204E6F64652E6A732064616E204D6963726F73657276696365732064616C616D2041706C696B6173692052656769737472617369204D616861736973776120426172752054656C6B6F6D20556E69766572736974792E706466-page-18',
    ],
  })
  citationId: string[];
}