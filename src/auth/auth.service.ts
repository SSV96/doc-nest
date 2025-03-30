import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RolesEnum } from '../common/enum/roles.enum';
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ accessToken: string }> {
    const { email, password, role } = registerDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log({ hashedPassword });
    const user = await this.userService.upsertUser({
      email,
      password: hashedPassword,
      role: role || RolesEnum.VIEWER,
    });
    const payload = { email: user.email, sub: user.id, role: user.role };
    return { accessToken: await this.jwtService.signAsync(payload) };
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const { email, password } = loginDto;
    const user = await this.userService.findOneByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { email: user.email, sub: user.id, role: user.role };
    return { accessToken: this.jwtService.sign(payload) };
  }
}
