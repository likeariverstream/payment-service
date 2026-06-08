import { z } from 'zod';

export const createMerchantBodySchema = z.object({
  name: z.string(),
  feePercent: z
    .number()
    .refine((value: number) => {
      const regex = /^-?\d+(\.\d{1,4})?$/;

      return Number.isFinite(value) && regex.test(value.toString());
    })
    .min(0)
    .max(1),
});

export const getMerchantsQuerySchema = z.object({
  page: z.coerce.number().int().optional(),
  perPage: z.coerce.number().int().optional(),
});
