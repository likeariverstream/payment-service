import { randomUUID } from 'node:crypto';

import { type Request, type Response } from 'express';

const merchantSettings = new Map<string, { feePercent: number }>();

export const createInvoiceHandler = async (req: Request, res: Response) => {
  const invoiceId = randomUUID();
  const { amount, merchantId } = req.body;

  if (!merchantSettings.get(merchantId)?.feePercent) {
    res.status(404).send({
      error: 'merchant not found',
    });
  }

  const feePercent = merchantSettings.get(merchantId)?.feePercent;

  if (!feePercent) {
    res.status(404).send({
      error: 'merchant not found',
    });
    return;
  }

  const fee = amount * feePercent;
  const amountToReceive = amount - fee;

  const body = {
    invoiceId,
    amountToReceive,
    fee,
  };

  res.json(body);
};
