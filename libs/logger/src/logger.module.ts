import { DynamicModule, Module } from '@nestjs/common';
import { LoggerService } from './logger.service';

@Module({})
export class LoggerModule {
  static register(options: Record<string, any>): DynamicModule {
    return {
      global: true,
      module: LoggerModule,
      providers: [
        {
          provide: 'CONFIG_OPTIONS',
          useValue: options,
        },
        LoggerService,
      ],
      exports: [LoggerService],
    };
  }
}
