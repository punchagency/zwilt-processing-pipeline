import {NextFunction, Response} from 'express';
export const saveUserType = (req: any, _res: Response, next: NextFunction) => {
  req.session.domain = req.headers.referer;
  if (req.query.isTalentProfile) {
    req.session.isTalentProfile = req.query.isTalentProfile;
  } else {
    req.session.isTalentProfile = null;
  }
  if (req.query.roles) {
    req.session.roles = req.query.roles;
  } else {
    req.session.roles = null;
  }
  req.session.save();
  next();
};
