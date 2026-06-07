import { type Request, type Response } from 'express';

const invoices = new Map<string, { status: 'pending' | 'paid' | 'failed' }>();

export const getInvoiceByIdHandler = async (req: Request, res: Response) => {
  const id = req.params.id;

  if (typeof id !== 'string') {
    res.status(400).send({
      message: 'Invoice id required',
    });
    return;
  }

  const invoice = invoices.get(id);

  res.json({
    invoiceId: id,
    status: invoice?.status,
  });
};
