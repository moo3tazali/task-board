import {
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';

import { Payload } from '../interfaces';

// creates a decorator that can be used to extract the user from the request
export const Auth = createParamDecorator(
  (data: keyof Payload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Req>();
    const user = request.user as Payload;

    if (data) {
      return user[data];
    }

    return user;
  },
);
