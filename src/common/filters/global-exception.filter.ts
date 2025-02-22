import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '../interfaces';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (!exception?.getStatus && !exception?.getResponse) {
      return response.status(500).json({
        status: {
          code: 500,
          message: 'Internal Server Error',
          error: true,
          validationsErrors: null,
        },
        data: null,
      } satisfies ApiResponse<null>);
    }

    const status = exception?.getStatus();
    const exceptionResponse = exception?.getResponse();
    const cause = (exception.cause as string) || 'root';

    let message: string = '';
    const validationsErrors: { [key: string]: string[] } = {};

    if (
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse &&
      'error' in exceptionResponse
    ) {
      const messages = exceptionResponse['message'];
      const error = exceptionResponse['error'] as string;

      if (Array.isArray(messages)) {
        messages.forEach((message: string) => {
          const field = message.split(' ').shift() ?? cause;

          if (!validationsErrors[field]) {
            validationsErrors[field] = [];
          }

          validationsErrors[field].push(message);
        });
        message = error;
      } else if (typeof messages === 'string') {
        // Handle the case where the response is a simple string message
        message = messages;
      }
    }

    response.status(status).json({
      status: {
        code: status,
        message,
        error: true,
        validationsErrors:
          Object.keys(validationsErrors).length > 0
            ? validationsErrors
            : null,
      },
      data: null,
    } satisfies ApiResponse<null>);
  }
}
