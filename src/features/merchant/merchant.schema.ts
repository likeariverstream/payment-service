import { z } from 'zod';

export const createMerchantBodySchema = z.object({
  name: z.string(),
  feePercent: z.number(),
});

export const getMerchantsQuerySchema = z.object({
  page: z.coerce.number().int().optional(),
  perPage: z.coerce.number().int().optional(),
});
