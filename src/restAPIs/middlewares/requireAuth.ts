import {NextFunction, Request, Response} from 'express';
import ClientResponse from '../../utilities/response';

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.send(new ClientResponse(400, false, 'Not authorized', null));
  }
  return next();
};
