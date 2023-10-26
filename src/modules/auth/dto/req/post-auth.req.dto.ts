import { User } from '@entities/user.entity';
import { ApiProperty, PickType } from '@nestjs/swagger';
import * as regex from '@src/common/regex';
import { IsBoolean, Matches } from 'class-validator';

export class PostAuthReqDto extends PickType(User, ['email']) {
  @Matches(regex.password.user)
  @ApiProperty({ pattern: regex.password.user.toString() })
  password: string;

  @ApiProperty({ format: 'boolean' })
  @IsBoolean()
  remember: boolean;
}
