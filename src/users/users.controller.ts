import {
  Controller,
  Get,
  Param,
  Patch,
  Delete,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { RolesEnum } from '../common/enum/roles.enum';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles(RolesEnum.ADMIN)
  @ApiOperation({ summary: 'Retrieve all users (Admin only)' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.usersService.findAll(paginationDto);
  }

  @Get(':id')
  @Roles(RolesEnum.ADMIN)
  @ApiOperation({ summary: 'Retrieve a user by ID (Admin only)' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/role')
  @Roles(RolesEnum.ADMIN)
  @ApiOperation({ summary: 'Update user role (Admin only)' })
  updateUserRole(
    @Param('id') id: string,
    @Body() updateDto: { role: RolesEnum },
  ) {
    return this.usersService.updateUserRole(id, updateDto.role);
  }

  @Delete(':id')
  @Roles(RolesEnum.ADMIN)
  @ApiOperation({ summary: 'Delete a user (Admin only)' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
