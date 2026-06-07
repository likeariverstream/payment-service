import express from 'express';

import { apiV1Router } from '~/router.js';

export const buildApp = () => {
  const app = express();

  app.use(express.json());

  app.use('/api/v1', apiV1Router);

  return app;
};
