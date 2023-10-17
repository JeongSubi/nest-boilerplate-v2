import { ConflictException } from '@nestjs/common';

export class DuplicatedException extends ConflictException {
  constructor(error: string = 'duplicate') {
    super(error);
  }
}
