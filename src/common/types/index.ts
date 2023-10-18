import { Request, Response } from 'express';

export interface SessionStore {
  userSession: (request: Request, response: Response, next: () => void) => void;
}
