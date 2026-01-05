import {
  Get,
  Controller,
  Post,
  Put,
  Body,
  UsePipes,
  Req,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '@app/user/user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUserDto } from '@app/user/dto/get-user.dto';
import { UserResponseInterface } from '@app/user/types/userResponse.interface';
import { Request } from 'express';
import { ExpressRequestInterface } from '@app/types/expressRequest.interface';
import { User } from '@app/user/decorators/user.decorator';
import { UserEntity } from '@app/user/user.entity';
import { AuthGuard } from '@app/user/guards/auth.guard';
import * as cluster from 'node:cluster';
import { UpdateUserDto } from '@app/user/dto/updateUser.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('users/create')
  @UsePipes(new ValidationPipe())
  async createUser(
    @Body('user') createUserDto: CreateUserDto,
  ): Promise<UserResponseInterface> {
    return this.userService.createUser(createUserDto);
  }

  // NeedCreateUser Check
  @Post('users/login')
  @UsePipes(new ValidationPipe())
  async login(
    @Body('user') getUserDto: GetUserDto,
  ): Promise<UserResponseInterface> {
    // console.log('getUserDto', getUserDto)

    console.log(getUserDto);

    return this.userService.login(getUserDto);
  }

  @Get('user')
  @UseGuards(AuthGuard)
  async currentUser(
    // @Req() request: ExpressRequestInterface,
    @User() user: UserEntity,
    @User('id') currentUserId: number,
  ): Promise<any> {
    // console.log('user', user)
    // console.log('currentUserId', currentUserId)
    return this.userService.buildUserResponse(user);
  }

  @Put('user')
  @UseGuards(AuthGuard)
  async updateCurrentUser(
    // @User() user: UserEntity,
    @User('id') userId: number,
    @Body('user') updateUserDto: UpdateUserDto,
  ): Promise<UserResponseInterface> {
    // console.log('ttt currentUserId',currentUserId)
    const user = await this.userService.updateUser(userId, updateUserDto);
    return this.userService.buildUserResponse(user);
  }

  @Get('users')
  @UseGuards(AuthGuard)
  async getUsers(): Promise<UserEntity[]> {
    return this.userService.getUsers();
  }
}
