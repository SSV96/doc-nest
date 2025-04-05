import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterDto } from '../auth/dto/register.dto';
import { RolesEnum } from '../common/enum/roles.enum';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import {
  PaginatedResponseDto,
  PaginationMetaDto,
} from 'src/common/dto/paginated-resonse.dto';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}
  async upsertUser(registerDto: RegisterDto): Promise<User> {
    const { email } = registerDto;
    const user = await this.usersRepository.findOne({ where: { email } });
    if (user) {
      return user;
    }
    const newUser = await this.usersRepository.save(registerDto);
    return newUser;
  }
  async findAll(
    pagination?: PaginationDto,
  ): Promise<PaginatedResponseDto<User>> {
    const { page, limit, orderBy } = pagination;
    const skip = (page - 1) * limit;

    const [items, totalItems] = await this.usersRepository
      .createQueryBuilder('users')
      .select([
        'users.id',
        'users.email',
        'users.role',
        'users.createdAt',
        'users.updatedAt',
      ])
      .orderBy('users.createdAt', orderBy)
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const meta = new PaginationMetaDto({
      page,
      limit,
      totalItems,
    });

    return { meta, items };
  }

  findOne(id: string): Promise<User> {
    return this.usersRepository.findOneBy({ id });
  }

  findOneByEmail(email: string): Promise<User> {
    return this.usersRepository.findOneBy({ email });
  }

  async updateUserRole(id: string, role: RolesEnum): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    user.role = role;
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
