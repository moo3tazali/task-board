import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { map } from 'rxjs';
import { ApiResponse } from '../model';

@Injectable()
export class TransformResInterceptor<T> implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<T>) {
    const request = context.switchToHttp().getRequest<Req>();
    const url = request.url;

    // ignore requests that don't start with /api for transformation to API response format
    if (!url.startsWith('/api')) {
      return next.handle();
    }

    // transform the response to API response format
    return next.handle().pipe(
      map((data): ApiResponse<T> => {
        const response = context
          .switchToHttp()
          .getResponse<Response>();
        const statusCode = response.statusCode;

        return {
          status: {
            code: statusCode,
            message: 'Success',
            error: false,
            validationsErrors: null,
          },
          data,
        };
      }),
    );
  }
}
