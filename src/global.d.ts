import { Request as ExpressRequest } from 'express';
import { Payload } from './users/model';

declare module 'express' {
  interface Request {
    // Add the user property to the Request object
    user: Payload;
  }
}

declare global {
  type Req = ExpressRequest;
  type MulterFile = Express.Multer.File;
}
