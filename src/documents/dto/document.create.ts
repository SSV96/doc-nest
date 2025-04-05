import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
export class FileMetaInfoDto {
  @ApiProperty({ example: 'resume.pdf' })
  @IsString()
  @Transform(({ value }) => value ?? 'unknown.pdf')
  originalName: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  @Transform(({ value }) => value ?? 'application/octet-stream')
  mimeType: string;

  @ApiProperty({ example: 204800 }) // 200 KB
  @IsNumber()
  @Transform(({ value }) => value ?? 0)
  size: number;

  @ApiProperty({ example: '7bit' })
  @IsString()
  @Transform(({ value }) => value ?? '7bit')
  encoding: string;

  @ApiProperty({ example: 'file' })
  @IsString()
  @Transform(({ value }) => value ?? 'file')
  fieldName: string;
}

export class DocumentCreateDto {
  @ApiProperty({
    example: 'Project Proposal',
    description: 'Title of the document',
  })
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    type: FileMetaInfoDto,
    description: 'Information about the Document',
  })
  metaInfo: FileMetaInfoDto;

  @ApiProperty({
    example: 'https://example.com/document.pdf',
    description: 'URL of the document',
    required: false,
  })
  url: string;
}
