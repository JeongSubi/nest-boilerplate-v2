import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { PostAuthRegisterReqDto } from '@modules/auth/dto/req/post-auth-register.req.dto';
import { DataSource } from 'typeorm';
import { DuplicatedException, UserNotFoundException } from '@common/exceptions';
import { createPasswordHash, passwordIterations, verifyPassword } from '@common/code';
import { UsersRepository } from '@repositories/users.repository';
import { User } from '@entities/user.entity';
import { PutAuthReqDto } from '@modules/auth/dto/req/put-auth.req.dto';

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
      await this.verifyDuplicateUserEmail(email);

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

  async validateUserByEmail(email: string, password: string) {
    try {
      const user: User = await this.usersRepository.findOne({
        where: { email },
      });
      if (user) {
        if (verifyPassword(password, user.password, user.salt, passwordIterations.user)) {
          return { id: user.id, salt: user.salt };
        }

        throw new BadRequestException('invalid_account');
      }

      throw new UserNotFoundException();
    } catch (error) {
      throw error;
    }
  }

  async changePassword({
    password,
    newPassword,
    userId,
  }: PutAuthReqDto & { userId: string }): Promise<string> {
    if (password === newPassword) throw new BadRequestException('same_password');

    const user: User = await this.usersRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new ConflictException('not_found_user');
    }

    if (!verifyPassword(password, user.password, user.salt, passwordIterations.user)) {
      throw new BadRequestException('wrong_password');
    }

    const passwordHash = createPasswordHash(newPassword, passwordIterations.user);

    await this.usersRepository.update(
      { id: userId },
      { password: passwordHash.password, salt: passwordHash.salt },
    );

    return passwordHash.salt;
  }
}
