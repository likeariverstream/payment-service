import { type Request, type Response } from 'express';

import { Merchant } from '~/features/merchant/merchant.model.js';

export const getMerchantsHandler = async (req: Request, res: Response) => {
  const { page = 1, perPage = 50 } = req.query;

  const limit = Number(perPage);
  const skip = (Number(page) - 1) * limit;

  const merchants = await Merchant.find()
    .skip(skip)
    .limit(limit)
    .select({
      externalId: 1,
      name: 1,
      feePercent: 1,
      _id: 0,
    })
    .exec();

  const result = merchants.map(merchant => ({
    merchantId: merchant.externalId,
    name: merchant.name,
    feePercent: merchant.feePercent,
  }));

  res.json(result);
};
