import { Request, Response } from 'express';

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
