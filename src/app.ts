import express from 'express';
import swaggerUi from 'swagger-ui-express';

import { apiV1Router } from '~/router.js';

import swaggerDocument from './swagger.json' with { type: 'json' };

export const buildApp = () => {
  const app = express();

  app.use(express.json());
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.use('/api/v1', apiV1Router);

  return app;
};
