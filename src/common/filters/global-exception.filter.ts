import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '../model';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    const cause = (exception.cause as string) || 'root';

    let message: string = '';
    const validationsErrors: { [key: string]: string[] } = {};

    if (
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      const Errors = exceptionResponse['message'];

      if (Array.isArray(Errors)) {
        Errors.forEach((message: string) => {
          const field =
            message.split(' ').shift()?.toLocaleLowerCase() ?? cause;

          if (!validationsErrors[field]) {
            validationsErrors[field] = [];
          }

          validationsErrors[field].push(message);
        });
      } else if (typeof Errors === 'string') {
        // Handle the case where the response is a simple string message
        message = Errors;
      }
    }

    response.status(status).json({
      status: {
        code: status,
        message,
        error: true,
        validationsErrors,
      },
      data: null,
    } satisfies ApiResponse<null>);
  }
}
