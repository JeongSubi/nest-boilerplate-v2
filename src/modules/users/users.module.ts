import { Module } from '@nestjs/common';
import { UsersController } from '@modules/users/users.controller';
import { UsersService } from '@modules/users/users.service';
import { UsersRepository } from '@repositories/users.repository';

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
})
export class UsersModule {}
