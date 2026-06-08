import { type Request, type Response } from 'express';

import { Merchant } from '~/features/merchant/merchant.model.js';

export const createMerchantHandler = async (req: Request, res: Response) => {
  const { name, feePercent } = req.body;

  const existingMerchant = await Merchant.findOne({
    name,
  });

  if (existingMerchant) {
    res.status(400).send({
      error: 'Merchant already exists',
    });

    return;
  }

  const newMerchant = new Merchant({
    name,
    feePercent,
  });

  await newMerchant.save();

  const object = newMerchant.toObject();
  const result = {
    merchantId: object.externalId,
    name: object.name,
    feePercent: object.feePercent,
  };

  res.status(201).json(result);
};
