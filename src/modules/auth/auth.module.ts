import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '@entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from '@repositories/users.repository';
import { AwsModule } from '@libs/aws/src';
import { UsersService } from '@modules/users/users.service';

@Module({
  imports: [AwsModule, TypeOrmModule.forFeature([User])],
  controllers: [AuthController],
  providers: [AuthService, UsersRepository, UsersService],
})
export class AuthModule {}
