import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { v4 as uuidV4 } from 'uuid';

@Injectable()
export class AssignIdMiddleware implements NestMiddleware {
  use(request: any, response: Response, next: NextFunction) {
    request.id = uuidV4();
    next();
  }
}
