import { IS_PUBLIC_KEY } from '@common/constants';
import { User, UserRole } from '@entities/user.entity';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SessionItem, SessionType } from '@src/common/types';
import { UsersRepository } from '@repositories/users.repository';

type AuthenticationGuardType = {
  [type in SessionType]: () => Promise<boolean>;
};

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userRepository: UsersRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic: boolean = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const session: SessionItem = request.session;

    const authenticationGuard: AuthenticationGuardType = {
      user: async (): Promise<boolean> => {
        if (session.userId) {
          const user: User = await this.userRepository.findOne({
            where: { id: session.userId, role: UserRole.USER },
          });

          if (user) {
            request.user = user;

            if (session.salt && user.salt !== session.salt) {
              throw new UnauthorizedException('invalid_session');
            }
            return true;
          }
        }
      },
      admin: async (): Promise<boolean> => {
        if (session.adminId) {
          const admin: User = await this.userRepository.findOne({
            where: { id: session.userId, role: UserRole.ADMIN },
          });

          if (admin) {
            request.admin = admin;

            if (session.salt && admin.salt !== session.salt) {
              throw new UnauthorizedException('invalid_session');
            }
            return true;
          }
        }
      },
    };
    const active: boolean = await authenticationGuard[session.type]?.();

    if (!active) {
      throw new UnauthorizedException('invalid_session');
    }
    return true;
  }
}
