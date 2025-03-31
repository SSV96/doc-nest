import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const mockUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  password: '$2b$10$hashpassword',
  role: 'USER',
};

const mockUsersService = {
  upsertUser: jest.fn().mockResolvedValue(mockUser),
  findOneByEmail: jest.fn().mockResolvedValue(mockUser),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mockAccessToken'),
  signAsync: jest.fn().mockResolvedValue('mockAccessToken'),
};

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('should hash password, save user, and return access token', async () => {
      jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValueOnce('hashedPassword' as never);
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password',
        role: 'USER',
      };
      const result = await authService.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(usersService.upsertUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'USER',
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        email: 'test@example.com',
        userId: mockUser.id,
        role: 'USER',
      });
      expect(result).toEqual({ accessToken: 'mockAccessToken' });
    });
  });

  describe('login', () => {
    it('should return an access token if credentials are valid', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true as never);
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const result = await authService.login(loginDto);

      expect(usersService.findOneByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password',
        mockUser.password,
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: 'test@example.com',
        userId: mockUser.id,
        role: 'USER',
      });
      expect(result).toEqual({ accessToken: 'mockAccessToken' });
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false as never);
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };
      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
