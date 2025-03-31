import { IsNotEmpty } from 'class-validator';

export class DocumentCreateDto {
  @IsNotEmpty()
  title: string;

  url: string;
}
