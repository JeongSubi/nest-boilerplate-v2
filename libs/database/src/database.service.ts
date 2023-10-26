import { Injectable } from '@nestjs/common';

@Injectable()
export class DatabaseService {
  createTypeOrmOptions(options: any) {
    return options;
  }
}
