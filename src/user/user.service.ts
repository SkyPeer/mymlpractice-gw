import {
  Injectable,
  HttpException,
  HttpStatus,
  NotImplementedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './user.entity';
import { sign } from 'jsonwebtoken';
import { JWT_SECRET } from '@app/config';
import { compare } from 'bcrypt';
import { UserResponseInterface } from '@app/user/types/userResponse.interface';
import { GetUserDto } from '@app/user/dto/get-user.dto';
import { UpdateUserDto } from '@app/user/dto/updateUser.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  findById(id: number): Promise<UserEntity> {
    return this.userRepository.findOne({ where: { id } });
  }

  generateJwt(user: UserEntity): any {
    return sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      JWT_SECRET,
    );
  }

  buildUserResponse(user: UserEntity): UserResponseInterface {
    return {
      user: {
        ...user,
        token: this.generateJwt(user),
      },
    };
  }

  async createUser(
    createUserDto: CreateUserDto,
  ): Promise<UserResponseInterface> {
    const userByEmail = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    const userByUsername = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    });
    if (userByUsername || userByEmail) {
      throw new HttpException(
        'User already exists',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const newUser = new UserEntity();
    Object.assign(newUser, createUserDto);
    const user = await this.userRepository.save(newUser);
    return this.buildUserResponse(user);
  }

  // async checkPassword(getUserDto, userByEmail): Promise<any> {
  //     const check = await compare(getUserDto.password, userByEmail.password)
  //
  //     if(!check){
  //         // throw new HttpException('PasswordError', HttpStatus.UNPROCESSABLE_ENTITY)
  //         throw new Error()
  //     }
  //
  //     return true;
  // }

  async login(getUserDto: GetUserDto): Promise<any> {
    const userByEmail = await this.userRepository.findOne({
      where: { email: getUserDto.email },
      // CustomSqlSelect
      select: ['id', 'username', 'bio', 'email', 'image', 'password'],
    });

    if (!userByEmail) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const isPasswordCorrect = await compare(
      getUserDto.password,
      userByEmail.password,
    );

    if (!isPasswordCorrect) {
      throw new HttpException('Password error', HttpStatus.FORBIDDEN);
    }

    // try {
    //     await this.checkPassword(getUserDto, userByEmail)
    // } catch (err) {
    //     throw new HttpException('Password Error', HttpStatus.FORBIDDEN)
    // }

    delete userByEmail.password;

    return this.buildUserResponse(userByEmail);
  }

  async updateUser(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    // this.userRepository.update()
    const data = { ...user, ...updateUserDto };
    return await this.userRepository.save(data);
    // return this.buildUserResponse(user)
  }

  async getUsers(): Promise<UserEntity[]> {
    return await this.userRepository.find();
  }
}
