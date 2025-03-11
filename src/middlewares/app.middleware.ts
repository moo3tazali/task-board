import { Request, Response, NextFunction } from 'express';

export function docs(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  res.redirect('/docs');
  next();
}
