import { Module } from '@nestjs/common';
import { UsersController } from '@modules/users/users.controller';
import { UsersService } from '@modules/users/users.service';
import { UsersRepository } from '@repositories/users.repository';
import { User } from '@entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
})
export class UsersModule {}
