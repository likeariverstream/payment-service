import { z } from 'zod';

export const createInvoiceBodySchema = z.object({
  amount: z.number().int().min(0),
  merchantId: z.string(),
  currency: z.string(),
});

export const getInvoiceParamsSchema = z.object({
  id: z.uuid(),
});
