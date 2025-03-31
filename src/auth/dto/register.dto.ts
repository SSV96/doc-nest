import { IsEmail, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RolesEnum } from '../../common/enum/roles.enum';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'StrongPassword123!',
    description: 'User password',
    minLength: 6,
  })
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: RolesEnum.VIEWER,
    description: 'Viewer role',
    enum: RolesEnum,
    required: false,
  })
  @IsEnum(RolesEnum)
  role?: string;
}
