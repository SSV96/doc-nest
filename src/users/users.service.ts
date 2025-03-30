import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterDto } from '../auth/dto/register.dto';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}
  async upsertUser(registerDto: RegisterDto): Promise<User> {
    const { email } = registerDto;
    const user = await this.usersRepository.findOne({ where: { email } });
    console.log({ user });
    if (user) {
      return user;
    }
    return this.usersRepository.save(user);
  }
  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: string): Promise<User> {
    return this.usersRepository.findOneBy({ id });
  }

  findOneByEmail(email: string): Promise<User> {
    return this.usersRepository.findOneBy({ email });
  }

  async update(id: string, updateDto: Partial<User>): Promise<User> {
    const userToUpdate = await this.findOne(id);
    return this.usersRepository.save({ ...userToUpdate, ...updateDto });
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
