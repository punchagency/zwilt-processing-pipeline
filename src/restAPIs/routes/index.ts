import {Router} from 'express-serve-static-core';
import Auth from './zwiltStore/auth';

export default function Routes(app: {
  use: (path: string, expressRoute: Router) => void;
}) {
  app.use('/api/auth', Auth);
}
