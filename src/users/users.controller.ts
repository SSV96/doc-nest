import {
  Controller,
  Get,
  Param,
  Patch,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard) // Apply both guards globally for this controller
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles('admin') // Only admins can list all users
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles('admin') // Only admins can view a specific user
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin') // Only admins can update users
  update(@Param('id') id: string, @Body() updateDto: Partial<User>) {
    return this.usersService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('admin') // Only admins can delete users
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
