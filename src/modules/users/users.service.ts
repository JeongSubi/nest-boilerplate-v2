import { User } from '@entities/user.entity';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '@repositories/users.repository';
import { GetUserResDto } from '@modules/users/dto/res/get-user.res.dto';
import { UserNotFoundException } from '@common/exceptions';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async findOne(id: string): Promise<GetUserResDto> {
    const user: User = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) throw new UserNotFoundException();

    return user;
  }
}
