import { dinero, multiply, subtract } from 'dinero.js';
import { type Request, type Response } from 'express';

import { Invoice } from '~/features/invoice/invoice.model.js';
import { Merchant } from '~/features/merchant/merchant.model.js';
import { getCurrency } from '~/utils/get-currency.js';

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
      error: 'Merchant not found',
    });
    return;
  }
  const feePercent = merchant.feePercent;

  const dineroCurrency = getCurrency(currency);

  if (!dineroCurrency) {
    res.status(400).send({
      error: 'Currency not supported',
    });
    return;
  }

  const dineroAmount = dinero({
    amount: amount,
    currency: dineroCurrency,
  });

  const dineroFee = multiply(dineroAmount, {
    amount: feePercent,
  });

  const dineroAmountToReceive = subtract(dineroAmount, dineroFee);

  const amountToReceive = dineroAmountToReceive.toJSON().amount;
  const fee = dineroFee.toJSON().amount;

  const newInvoice = new Invoice({
    merchantId,
    amount,
    amountToReceive,
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

  res.status(201).json(result);
};
