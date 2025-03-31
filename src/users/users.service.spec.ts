import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { NotFoundException } from '@nestjs/common';
import { RolesEnum } from '../common/enum/roles.enum';
import { RegisterDto } from '../auth/dto/register.dto';

describe('UsersService', () => {
  let service: UsersService;

  const mockUsersRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('upsertUser', () => {
    it('should return existing user if found', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const user = { id: '1', email: 'test@example.com' };
      mockUsersRepository.findOne.mockResolvedValue(user);

      const result = await service.upsertUser(registerDto);
      expect(result).toEqual(user);
    });

    it('should create a new user if not found', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const newUser = { id: '1', email: 'test@example.com' };
      mockUsersRepository.findOne.mockResolvedValue(null);
      mockUsersRepository.save.mockResolvedValue(newUser);

      const result = await service.upsertUser(registerDto);
      expect(result).toEqual(newUser);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [{ id: '1', email: 'test@example.com' }];
      mockUsersRepository.find.mockResolvedValue(users);

      const result = await service.findAll();
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return a user by ID', async () => {
      const user = { id: '1', email: 'test@example.com' };
      mockUsersRepository.findOneBy.mockResolvedValue(user);

      const result = await service.findOne('1');
      expect(result).toEqual(user);
    });
  });

  describe('findOneByEmail', () => {
    it('should return a user by email', async () => {
      const user = { id: '1', email: 'test@example.com' };
      mockUsersRepository.findOneBy.mockResolvedValue(user);

      const result = await service.findOneByEmail('test@example.com');
      expect(result).toEqual(user);
    });
  });

  describe('updateUserRole', () => {
    it('should update user role', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        role: RolesEnum.EDITOR,
      };
      mockUsersRepository.findOne.mockResolvedValue(user);
      mockUsersRepository.save.mockResolvedValue({
        ...user,
        role: RolesEnum.ADMIN,
      });

      const result = await service.updateUserRole('1', RolesEnum.ADMIN);
      expect(result.role).toEqual(RolesEnum.ADMIN);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateUserRole('1', RolesEnum.ADMIN),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      mockUsersRepository.delete.mockResolvedValue({ affected: 1 });

      await expect(service.remove('1')).resolves.toBeUndefined();
    });
  });
});
