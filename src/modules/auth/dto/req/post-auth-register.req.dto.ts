import { User, UserRole } from '@entities/user.entity';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import * as regex from '@src/common/regex';
import { IsBoolean, IsEnum, IsOptional, Matches } from 'class-validator';

export class PostAuthRegisterReqDto extends OmitType(User, [
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'salt',
  'role',
  'agreeMarketing',
  'agreeNotification',
  'agreeReceiveEmail',
]) {
  @Matches(regex.password.user)
  @ApiProperty({ pattern: regex.password.user.toString(), required: true })
  password: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    format: 'boolean',
    required: false,
  })
  agreeMarketing?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    format: 'boolean',
    required: false,
  })
  agreeReceiveEmail?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    format: 'boolean',
    required: false,
  })
  agreeNotification?: boolean;

  @IsOptional()
  @IsEnum(UserRole)
  @ApiProperty({
    format: 'enum',
    required: false,
  })
  role?: UserRole;
}
