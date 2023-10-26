import { LoggerService } from '@app/logger/logger.service';
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const context: HttpArgumentsHost = host.switchToHttp();
    const response = context.getResponse();
    const request = context.getRequest();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string;
    const body: any = { id: request.id };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionBody: string | Object = exception.getResponse();

      if (typeof exceptionBody === 'string') {
        message = exceptionBody;
      } else if (exceptionBody) {
        message = exceptionBody['message'];
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    if (Array.isArray(message)) {
      body.message = message.join(', ');
    } else {
      body.message = message;
    }

    if (
      process.env.NODE_ENV !== 'production' &&
      status === HttpStatus.INTERNAL_SERVER_ERROR &&
      exception instanceof Error
    ) {
      body.stack = exception.stack;
    }

    const errorData = {
      reqId: body.id,
      stack: body.stack,
      status,
      url: request.url,
      method: request.method,
    };

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.fatal(message, errorData);
    } else if (process.env.NODE_ENV !== 'production') {
      this.logger.error(exception, errorData);
    }

    if (message === 'invalid_session' && request.session) {
      request.session.destroy();
    }

    response.status(status).json(body);
  }
}
