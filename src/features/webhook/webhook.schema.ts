import { z } from 'zod';

export const webhookBodySchema = z.object({
  invoiceId: z.uuid(),
  status: z.enum(['paid', 'failed']),
});
