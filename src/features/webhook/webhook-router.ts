import { Router } from 'express';

import { webhookBodySchema } from '~/features/webhook/webhook.schema.js';
import { webhookHandler } from '~/features/webhook/webhook-handler.js';
import { asyncHandler } from '~/utils/async-handler.js';
import { bodyValidator } from '~/validators/validators.js';

export const webhookRouter = Router();

webhookRouter.post(
  '/',
  bodyValidator(webhookBodySchema),
  asyncHandler(webhookHandler),
);
