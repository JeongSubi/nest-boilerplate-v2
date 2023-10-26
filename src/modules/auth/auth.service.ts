import { Injectable } from '@nestjs/common';
import { PostAuthRegisterReqDto } from '@modules/auth/dto/req/post-auth-register.req.dto';
import { DataSource } from 'typeorm';
import { DuplicatedException } from '@common/exceptions';
import { createPasswordHash, passwordIterations } from '@common/code';
import { UsersRepository } from '@repositories/users.repository';
import { User } from '@entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private readonly dataSource: DataSource,
  ) {}

  async register({
    email,
    name,
    phone,
    profileImage,
    password,
    role,
    agreeMarketing,
    agreeNotification,
    agreeReceiveEmail,
  }: PostAuthRegisterReqDto): Promise<string> {
    try {
      // await this.verifyDuplicateUserEmail(email);

      const passwordHash = createPasswordHash(password, passwordIterations.user);
      const user: User = new User({
        email,
        name,
        phone,
        profileImage,
        role,
        agreeMarketing,
        agreeNotification,
        agreeReceiveEmail,
        password: passwordHash.password,
        salt: passwordHash.salt,
      });

      await this.usersRepository.save(user);

      return user.id;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new DuplicatedException();
      }
      throw error;
    }
  }

  async verifyDuplicateUserEmail(email: string): Promise<boolean> {
    try {
      await this.usersRepository.findOneOrFail({
        where: { email },
      });
    } catch (error) {
      return true;
    }
    throw new DuplicatedException('duplicatedEmail');
  }
}
