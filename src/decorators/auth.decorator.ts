import { ROLE_KEY } from '@common/constants';
import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiCookieAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { SessionType } from '@src/common/types';

export function Auth(options: { type: SessionType; roles?: string[] }) {
  return applyDecorators(
    SetMetadata(ROLE_KEY, options),
    ApiCookieAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
