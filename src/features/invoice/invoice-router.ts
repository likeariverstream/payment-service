import { Router } from 'express';

import { createInvoiceHandler } from '~/features/invoice/create-invoice-handler.js';
import { getInvoiceByIdHandler } from '~/features/invoice/get-invoice-by-id-handler.js';
import { asyncHandler } from '~/utils/async-handler.js';

export const invoiceRouter = Router();

invoiceRouter.post('/', asyncHandler(createInvoiceHandler));
invoiceRouter.get('/:id', asyncHandler(getInvoiceByIdHandler));
