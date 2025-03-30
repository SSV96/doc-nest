import { IsEmail, IsNotEmpty, IsEnum } from 'class-validator';
import { RolesEnum } from '../../common/enum/roles.enum';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsEnum(RolesEnum)
  role?: string;
}
