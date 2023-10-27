import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
} from 'class-validator';
import * as regex from '@common/regex';
import { Column, Entity } from 'typeorm';
import { CoreEntity } from '@entities/core.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

@Entity({ name: 'user' })
export class User extends CoreEntity {
  @ApiProperty({ format: 'email', nullable: true })
  @IsEmail()
  @Column()
  email: string;

  @ApiProperty({ minLength: 1, maxLength: 20 })
  @IsString()
  @Length(1, 20)
  @Column({ length: 20 })
  name: string;

  @ApiProperty({ minLength: 1, maxLength: 200 })
  @IsString()
  @Length(1, 200)
  @Column({ length: 200 })
  salt: string;

  @IsEnum(UserRole)
  @Column({
    type: 'enum',
    enum: UserRole,
    comment: '권한',
    default: UserRole.USER,
  })
  role: UserRole;

  @ApiProperty({ minLength: 1, maxLength: 200 })
  @Length(1, 200)
  @Column({ length: 200 })
  password: string;

  @ApiProperty({ pattern: regex.phone.toString(), required: false })
  @Matches(regex.phone)
  @IsOptional()
  @Column({ nullable: true })
  phone?: string;

  @ApiProperty({ format: 'url', required: false })
  @IsUrl()
  @IsOptional()
  @Column({ nullable: true, name: 'profile_image' })
  profileImage?: string;

  @IsBoolean()
  @ApiProperty({ format: 'boolean' })
  @Column({ name: 'agree_marketing', default: true })
  agreeMarketing: boolean;

  @IsBoolean()
  @ApiProperty({ format: 'boolean' })
  @Column({ name: 'agree_notification', default: true })
  agreeNotification: boolean;

  @IsBoolean()
  @ApiProperty({ format: 'boolean' })
  @Column({ name: 'agree_receive_email', default: true })
  agreeReceiveEmail: boolean;

  constructor(partial: Partial<User>) {
    super();

    Object.assign(this, partial);
  }
}
