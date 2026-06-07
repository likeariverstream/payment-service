import { Router } from 'express';

import { webhookHandler } from '~/features/webhook/webhook-handler.js';
import { asyncHandler } from '~/utils/async-handler.js';

export const webhookRouter = Router();

webhookRouter.post('/', asyncHandler(webhookHandler));
