import { NextFunction, Request, Response } from 'express';

export function appMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.url === '/') {
    return res.redirect('/docs');
  }
  next();
}
