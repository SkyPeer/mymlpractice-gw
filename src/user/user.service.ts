import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './user.entity';
import { sign } from 'jsonwebtoken';
import { JWT_SECRET } from '@app/config';
import { compare, hash } from 'bcrypt';
import { UserResponseInterface } from '@app/user/types/userResponse.interface';
import { GetUserDto } from '@app/user/dto/get-user.dto';
import { UpdateUserDto } from '@app/user/dto/updateUser.dto';
import { UserRole } from '@app/user/types/role.enum';

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
        role: user.role,
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

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
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
    newUser.role = createUserDto.role ?? UserRole.USER;
    const user = await this.userRepository.save(newUser);
    delete user.password;
    return user;
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
      select: ['id', 'username', 'bio', 'email', 'image', 'password', 'role'],
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
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Demoting the only admin would leave nobody able to manage users.
    if (user.role === UserRole.ADMIN && updateUserDto.role === UserRole.USER) {
      await this.assertNotLastAdmin(user.id);
    }

    await this.assertUniqueCredentials(userId, updateUserDto);

    const { password, ...rest } = updateUserDto;
    const data: Partial<UserEntity> = { ...user, ...rest };
    if (password) {
      data.password = await hash(password, 10);
    }

    const saved = await this.userRepository.save(data);
    delete saved.password;
    return saved;
  }

  async getUsers(): Promise<UserEntity[]> {
    return await this.userRepository.find({ order: { id: 'ASC' } });
  }

  async deleteUser(currentUser: UserEntity, userId: number): Promise<void> {
    if (currentUser.id === userId) {
      throw new HttpException(
        'You can not delete your own account',
        HttpStatus.FORBIDDEN,
      );
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (user.role === UserRole.ADMIN) {
      await this.assertNotLastAdmin(user.id);
    }

    // Favorites are the user's own rows, so clear them; authored articles are
    // content and stay put — the FK below then reports the conflict.
    await this.userRepository
      .createQueryBuilder()
      .relation(UserEntity, 'favorites')
      .of(userId)
      .remove(await this.getFavoriteIds(userId));

    try {
      await this.userRepository.delete({ id: userId });
    } catch (err) {
      // 23503 = foreign_key_violation
      if (err?.driverError?.code === '23503' || err?.code === '23503') {
        throw new HttpException(
          'This user still owns articles. Reassign or remove them first.',
          HttpStatus.CONFLICT,
        );
      }
      throw err;
    }
  }

  private async getFavoriteIds(userId: number): Promise<number[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favorites'],
    });
    return user?.favorites?.map((article) => article.id) ?? [];
  }

  private async assertNotLastAdmin(userId: number): Promise<void> {
    const otherAdmins = await this.userRepository.count({
      where: { role: UserRole.ADMIN, id: Not(userId) },
    });
    if (otherAdmins === 0) {
      throw new HttpException(
        'The last admin account can not be removed or demoted',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  private async assertUniqueCredentials(
    userId: number,
    dto: UpdateUserDto,
  ): Promise<void> {
    if (dto.email) {
      const byEmail = await this.userRepository.findOne({
        where: { email: dto.email, id: Not(userId) },
      });
      if (byEmail) {
        throw new HttpException(
          'Email is already taken',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
    }

    if (dto.username) {
      const byUsername = await this.userRepository.findOne({
        where: { username: dto.username, id: Not(userId) },
      });
      if (byUsername) {
        throw new HttpException(
          'Username is already taken',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
    }
  }
}
