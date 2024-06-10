import {Router} from 'express-serve-static-core';
import VideoPipline from './zwiltStore/video-pipeline';

export default function Routes(app: {
  use: (path: string, expressRoute: Router) => void;
}) {
  app.use('/api/video-pipeline', VideoPipline);
}
