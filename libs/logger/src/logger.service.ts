import {
  Inject,
  Injectable,
  LoggerService as NestLoggerService,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { addColors, createLogger, format, Logger, transports } from 'winston';

const loggerLevels = {
  levels: {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    http: 4,
    verbose: 5,
    debug: 6,
    silly: 7,
  },
  colors: {
    fatal: 'magenta',
  },
};
addColors(loggerLevels.colors);
const colorize = format.colorize();

const consoleLoggerFormat = format.printf(({ level, message, timestamp, stack, reqId, ...asd }) => {
  let logMessage = '';
  if (reqId) logMessage += `${reqId} - `;
  logMessage += `${stack || message}`;
  return `${colorize.colorize(level, `[${timestamp}][${level.toUpperCase()}]`)} - ${logMessage}`;
});

@Injectable()
export class LoggerService implements NestLoggerService, OnModuleInit {
  logger: Logger;
  infoStream = {
    write: (text: string): void => {
      const { message, data } = this.parseHttpLog(text);
      this.logger.info(message, data);
    },
  };
  errorStream = {
    write: (text: string): void => {
      const { message, data } = this.parseHttpLog(text);
      if (data.status === '500') this.logger['fatal'](message, data);
      else this.logger.error(message, data);
    },
  };

  constructor(
    @Inject('CONFIG_OPTIONS') private options: Record<string, any>,
    private configService: ConfigService,
  ) {
    const logLevel = options.level ?? 'debug';

    if (['production'].includes(process.env.NODE_ENV)) {
      const { fluentTag, fluentConfig } = this.configService.get('logger');
      const loggerFormat = format.printf((info) => {
        const { level, message, stack } = info;
        return JSON.stringify({
          log: { ...info, message: `[${level.toUpperCase()}] - ${stack || message}` },
        });
      });
      this.logger = createLogger({
        levels: loggerLevels.levels,
        transports: [
          new transports.Console({
            level: logLevel,
            format: format.combine(
              format.timestamp(),
              format.errors({ stack: true }),
              consoleLoggerFormat,
            ),
            handleExceptions: true,
          }),
        ],
      });
    } else {
      this.logger = createLogger({
        levels: loggerLevels.levels,
        format: format.combine(
          format.timestamp(),
          format.errors({ stack: true }),
          consoleLoggerFormat,
        ),
        transports: [
          new transports.Console({
            level: logLevel,
            handleExceptions: true,
          }),
        ],
      });
    }
  }

  onModuleInit(): any {}

  debug(message: any, ...optionalParams: any[]): any {
    this.logger.debug(message, ...optionalParams);
  }

  error(message: any, ...optionalParams: any[]): any {
    this.logger.error(message, ...optionalParams);
  }

  log(message: any, ...optionalParams: any[]): any {
    this.logger.info(message, ...optionalParams);
  }

  verbose(message: any, ...optionalParams: any[]): any {
    this.logger.verbose(message, ...optionalParams);
  }

  warn(message: any, ...optionalParams: any[]): any {
    this.logger.warn(message, ...optionalParams);
  }

  fatal(message: any, ...optionalParams: any[]): any {
    this.logger.log('fatal', message, ...optionalParams);
  }

  parseHttpLog(text: string) {
    try {
      const data = JSON.parse(text);
      const message = `"${data.method} ${data.url}" ${data.status} ${data.responseTime} ms${
        data.body ? ` - ${JSON.stringify(data.body)}` : ''
      }`;
      delete data.body;
      return { message, data };
    } catch (error) {
      return { message: text };
    }
  }
}
