import { Router } from 'express';

import { createMerchantHandler } from '~/features/merchant/create-merchant.handler.js';
import { getMerchantsHandler } from '~/features/merchant/get-merchants.handler.js';
import {
  createMerchantBodySchema,
  getMerchantsQuerySchema,
} from '~/features/merchant/merchant.schema.js';
import { asyncHandler } from '~/utils/async-handler.js';
import { bodyValidator, queryValidator } from '~/validators/validators.js';

export const merchantRouter = Router();

merchantRouter.post(
  '/',
  bodyValidator(createMerchantBodySchema),
  asyncHandler(createMerchantHandler),
);
merchantRouter.get(
  '/',
  queryValidator(getMerchantsQuerySchema),
  asyncHandler(getMerchantsHandler),
);
