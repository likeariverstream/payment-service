import bodyParser from 'body-parser';
import express from 'express';

import { apiV1Router } from '~/router.js';

export const buildApp = () => {
  const app = express();
  app.use(
    bodyParser.json({
      verify: (req, _, buf: Buffer) => {
        (req as any).rawBody = buf.toString();
      },
    }),
  );

  app.use(express.json());

  app.use('/api/v1', apiV1Router);

  return app;
};
