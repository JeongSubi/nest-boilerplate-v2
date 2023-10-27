import { ApiProperty } from '@nestjs/swagger';
import * as regex from '@src/common/regex';
import { Matches } from 'class-validator';

export class PutAuthReqDto {
  @Matches(regex.password.user)
  @ApiProperty({ pattern: regex.password.user.toString() })
  password: string;

  @Matches(regex.password.user)
  @ApiProperty({ pattern: regex.password.user.toString() })
  newPassword: string;
}
