import type { Request, Response } from 'express';

export const webhookHandler = async (req: Request, res: Response) => {
  const xSignature = req.header('X-Signature');
  const xTimestamp = req.header('X-Timestamp');
  const xNonce = req.header('X-Nonce');
  const { invoiceId, status } = req.body;

  const body = {
    xSignature,
    xTimestamp,
    xNonce,
    invoiceId,
    status,
  };

  res.status(201).json(body);
};
