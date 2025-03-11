import { Request as ExpressRequest } from 'express';
import { User } from '@prisma/client';

declare module 'express' {
  interface Request {
    // Add the user property to the Request object
    user: Omit<User, 'passwordHash'>;
  }
}

declare module 'socket.io' {
  interface Socket {
    user: Omit<User, 'passwordHash'>;
  }
}

declare global {
  type Req = ExpressRequest;
  type MulterFile = Express.Multer.File;
  type Auth = Omit<User, 'passwordHash'>;
}
