import { type Request, type Response } from 'express';

import { Invoice } from '~/features/invoice/invoice.model.js';

export const getInvoiceStatusByIdHandler = async (
  req: Request,
  res: Response,
) => {
  const id = req.params.id;

  const invoice = await Invoice.findOne({
    externalId: id,
  }).select({
    status: 1,
    _id: 0,
  });

  if (!invoice) {
    res.status(404).send({
      error: 'Invoice not found',
    });
    return;
  }

  res.status(200).send(invoice);
};
