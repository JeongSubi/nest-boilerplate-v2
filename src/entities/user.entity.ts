import { IsEmail, IsOptional, IsUrl, Length, Matches, IsString } from 'class-validator';
import * as regex from '@common/regex';
import { Column, Entity } from 'typeorm';
import { CoreEntity } from '@entities/core.entity';

@Entity({ name: 'user' })
export class User extends CoreEntity {
  @IsEmail()
  @Column()
  email: string;

  @IsString()
  @Length(1, 20)
  @Column({ length: 20 })
  name: string;

  @IsString()
  @Length(1, 20)
  @Column({ length: 20 })
  salt: string;

  @Matches(regex.password)
  @Length(1, 20)
  @Column({ length: 20 })
  password: string;

  @Matches(regex.phone)
  @IsOptional()
  @Column({ nullable: true })
  phone?: string;

  @IsUrl()
  @IsOptional()
  @Column({ nullable: true, name: 'profile_image' })
  profileImage?: string;

  constructor(partial: Partial<User>) {
    super();

    Object.assign(this, partial);
  }
}
