import { Request, Response } from 'express';
import { GetUserResDto } from '@modules/users/dto/res/get-user.res.dto';

export interface SessionStore {
  userSession: (request: Request, response: Response, next: () => void) => void;
}

export type SessionType = 'user' | 'admin';

export interface SessionItem {
  salt: string;
  userId?: string;
  adminId?: string;
  type: SessionType;
  clientIp: string;
  useragent: string;
  cookie: {
    maxAge: number;
  };
  destroy: (error) => void;
}

export interface SessionInputData extends GetUserResDto {
  salt: string;
}

export interface RequestType extends Request {
  session: SessionItem;
  ip: string;
}
