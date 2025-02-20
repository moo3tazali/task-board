import {
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';

// creates a decorator that can be used to extract the user from the request
export const Auth = createParamDecorator(
  (data: keyof Auth | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Req>();
    const user = request.user;

    if (data) {
      return user[data];
    }

    return user;
  },
);
