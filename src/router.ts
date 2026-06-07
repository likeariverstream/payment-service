import { Router } from 'express';

import { invoiceRouter } from '~/features/invoice/invoice-router.js';
import { webhookRouter } from '~/features/webhook/webhook-router.js';

export const apiV1Router = Router();

apiV1Router.use('/invoice', invoiceRouter);
apiV1Router.use('/webhook', webhookRouter);
