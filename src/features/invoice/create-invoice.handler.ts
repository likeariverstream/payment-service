import { type Request, type Response } from 'express';

import { Invoice } from '~/features/invoice/invoice.model.js';
import { Merchant } from '~/features/merchant/merchant.model.js';

export const createInvoiceHandler = async (req: Request, res: Response) => {
  const { amount, merchantId, currency } = req.body;

  const merchant = await Merchant.findOne({
    externalId: merchantId,
  })
    .select({
      externalId: 1,
      name: 1,
      feePercent: 1,
      _id: 0,
    })
    .exec();

  if (!merchant) {
    res.status(404).send({
      error: 'merchant not found',
    });
    return;
  }

  const feePercent = merchant.feePercent;

  const fee = amount * feePercent;
  const amountToReceive = amount - fee;

  const newInvoice = new Invoice({
    merchantId,
    amount,
    amountToReceive: amountToReceive,
    fee,
    currency,
    status: 'pending',
  });

  await newInvoice.save();

  const object = newInvoice.toObject();

  const result = {
    invoiceId: object.externalId,
    amountToReceive: object.amountToReceive,
    fee: object.fee,
  };

  res.json(result);
};
