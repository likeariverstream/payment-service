import { Router } from 'express';

import { createInvoiceHandler } from '~/features/invoice/create-invoice.handler.js';
import { getInvoiceStatusByIdHandler } from '~/features/invoice/get-invoice-status-by-id.handler.js';
import {
  createInvoiceBodySchema,
  getInvoiceParamsSchema,
} from '~/features/invoice/invoice.schema.js';
import { asyncHandler } from '~/utils/async-handler.js';
import { bodyValidator, paramsValidator } from '~/validators/validators.js';

export const invoiceRouter = Router();

invoiceRouter.post(
  '/',
  bodyValidator(createInvoiceBodySchema),
  asyncHandler(createInvoiceHandler),
);
invoiceRouter.get(
  '/:id',
  paramsValidator(getInvoiceParamsSchema),
  asyncHandler(getInvoiceStatusByIdHandler),
);
