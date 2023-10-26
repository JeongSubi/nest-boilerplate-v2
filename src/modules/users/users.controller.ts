import { Controller } from '@nestjs/common';
import { UsersService } from '@modules/users/users.service';
import { Auth } from '@src/decorators';
import { ApiTags } from '@nestjs/swagger';

@Auth({ type: 'user' })
@ApiTags('회원 정보 관리')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
}
