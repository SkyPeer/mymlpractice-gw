import {
  Get,
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '@app/user/user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUserDto } from '@app/user/dto/get-user.dto';
import { UserResponseInterface } from '@app/user/types/userResponse.interface';
import { User } from '@app/user/decorators/user.decorator';
import { UserEntity } from '@app/user/user.entity';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { AdminGuard } from '@app/user/guards/admin.guard';
import { UpdateUserDto } from '@app/user/dto/updateUser.dto';
import { UpdateProfileDto } from '@app/user/dto/updateProfile.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // User Authentication
  @Post('login')
  @UsePipes(new ValidationPipe())
  async login(
    @Body('user') getUserDto: GetUserDto,
  ): Promise<UserResponseInterface> {
    return this.userService.login(getUserDto);
  }

  // Get CurrentUser(byToken)
  @Get('current')
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async getCurrentUser(
    @User('id') userId: number,
  ): Promise<UserResponseInterface> {
    const user = await this.userService.findById(userId);
    return this.userService.buildUserResponse(user);
  }

  // Editing your own profile — role is not part of UpdateProfileDto, the
  // whitelist strips it from the body and updateProfile() drops it again, so
  // only @Put(':id') can set it.
  // Declared above @Put(':id') so "current" is not read as an id.
  @Put('current')
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateCurrentUser(
    @User('id') userId: number,
    @Body('user') updateProfileDto: UpdateProfileDto,
  ): Promise<UserResponseInterface> {
    const user = await this.userService.updateProfile(userId, updateProfileDto);
    return this.userService.buildUserResponse(user);
  }

  // ----- Admin Endpoints ---- //
  @Get('admin/list')
  @UseGuards(AuthGuard, AdminGuard)
  async getUsers(): Promise<UserEntity[]> {
    return this.userService.getUsers();
  }

  @Post('admin/create')
  @UseGuards(AuthGuard, AdminGuard)
  @UsePipes(new ValidationPipe())
  async createUser(
    @Body('user') createUserDto: CreateUserDto,
  ): Promise<UserEntity> {
    return this.userService.createUser(createUserDto);
  }

  @Put('admin/:id')
  @UseGuards(AuthGuard, AdminGuard)
  @UsePipes(new ValidationPipe())
  async updateUser(
    @Param('id', ParseIntPipe) userId: number,
    @Body('user') updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    return this.userService.updateUserByAdmin(userId, updateUserDto);
  }

  @Delete('admin/:id')
  @UseGuards(AuthGuard, AdminGuard)
  async deleteUser(
    @User() currentUser: UserEntity,
    @Param('id', ParseIntPipe) userId: number,
  ): Promise<{ success: boolean }> {
    await this.userService.deleteUser(currentUser, userId);
    return { success: true };
  }
}
