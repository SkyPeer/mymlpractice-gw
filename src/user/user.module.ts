import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from '@app/user/user.controller';
import { UserEntity } from './user.entity';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { AdminGuard } from '@app/user/guards/admin.guard';

@Module({
  // providers: [UsersService],
  // exports: [UsersService],
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController],
  providers: [UserService, AuthGuard, AdminGuard],
  exports: [UserService],
})
export class UserModule {}
