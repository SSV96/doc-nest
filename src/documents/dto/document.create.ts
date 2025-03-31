import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DocumentCreateDto {
  @ApiProperty({
    example: 'Project Proposal',
    description: 'Title of the document',
  })
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'https://example.com/document.pdf',
    description: 'URL of the document',
    required: false,
  })
  url: string;
}
