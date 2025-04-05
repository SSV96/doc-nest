import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    description: 'Page number (starting from 1)',
    default: 1,
    minimum: 1,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  readonly page: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    default: 10,
    minimum: 1,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  readonly limit: number = 10;

  @ApiProperty({
    description: 'Sort by creation date',
    enum: ['OLD', 'NEW'],
    default: 'NEW',
    required: false,
  })
  @IsOptional()
  @IsEnum(['OLD', 'NEW'])
  readonly sortBy: 'OLD' | 'NEW' = 'NEW';

  @ApiProperty({
    description: 'Order direction',
    enum: ['ASC', 'DESC'],
    default: 'ASC',
    required: false,
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  readonly orderBy: 'ASC' | 'DESC' = 'ASC';
}
