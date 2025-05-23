import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ accessToken: string }> {
    const { email, password, role } = registerDto;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userService.upsertUser({
      email,
      password: hashedPassword,
      role,
    });
    const payload = { email: user.email, userId: user.id, role: user.role };
    return { accessToken: await this.jwtService.signAsync(payload) };
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const { email, password } = loginDto;
    const user = await this.userService.findOneByEmail(email);

    if (!user) {
      throw new NotFoundException('User not Found');
    }
    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { email: user.email, userId: user.id, role: user.role };
    return { accessToken: this.jwtService.sign(payload) };
  }
}
