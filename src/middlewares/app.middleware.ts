import { Request, Response } from 'express';

export function appMiddleware(_: Request, res: Response) {
  return res.redirect('/docs');
}
