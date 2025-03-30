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
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { RolesEnum } from 'src/common/enum/roles.enum';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles(RolesEnum.ADMIN) // Only admins can list all users
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(RolesEnum.ADMIN)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/role')
  @Roles(RolesEnum.ADMIN)
  updateUserRole(
    @Param('id') id: string,
    @Body() updateDto: { role: RolesEnum },
  ) {
    return this.usersService.updateUserRole(id, updateDto.role);
  }

  @Delete(':id')
  @Roles(RolesEnum.ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
