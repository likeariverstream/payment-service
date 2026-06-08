import crypto from 'node:crypto';

import type { Request, Response } from 'express';

import { Invoice } from '~/features/invoice/invoice.model.js';
import { redis } from '~/lib/redis.js';

export const webhookHandler = async (req: Request, res: Response) => {
  const xSignature = req.header('X-Signature');
  const xTimestamp = req.header('X-Timestamp');
  const xNonce = req.header('X-Nonce');
  const { invoiceId, status } = req.body;

  if (!xSignature) {
    res.status(400).send({
      error: 'X-Signature is missing',
    });

    return;
  }

  if (!xTimestamp) {
    res.status(400).send({
      error: 'X-Timestamp is missing',
    });

    return;
  }

  if (!xNonce) {
    res.status(400).send({
      error: 'X-Nonce is missing',
    });

    return;
  }

  const invoice = await Invoice.findOne({
    externalId: invoiceId,
  })
    .select({
      _id: 0,
      status: 1,
    })
    .exec();

  if (!invoice) {
    res.status(404).send({
      error: 'Invoice not found',
    });
    return;
  }

  if (invoice.status === 'paid') {
    res.status(400).send({
      error: 'Invoice already paid',
    });
    return;
  }

  const expectedSign = crypto
    .createHmac('sha256', String(process.env.SECRET_KEY))
    .update(JSON.stringify({ invoiceId, status }))
    .digest('hex');

  const signMatches = crypto.timingSafeEqual(
    Buffer.from(xSignature, 'utf8'),
    Buffer.from(expectedSign, 'utf8'),
  );

  if (!signMatches) {
    res.status(401).send({
      error: 'Invalid signature',
    });

    return;
  }

  const fiveMinAgo = Date.now() - 5 * 60 * 1000;
  const eventTimestamp = Number.parseInt(xTimestamp, 10);

  if (Number.isNaN(eventTimestamp) || eventTimestamp < fiveMinAgo) {
    res.status(401).send({
      error: 'Invalid or expired timestamp',
    });

    return;
  }

  const existingNonce = await redis.get(xNonce);

  if (existingNonce) {
    res.status(401).send({
      error: 'Nonce not unique',
    });

    return;
  }

  await redis.set(xNonce, xNonce, {
    expiration: {
      type: 'EX',
      value: 5 * 60,
    },
  });

  const updatedInvoice = await Invoice.findOneAndUpdate(
    { externalId: invoiceId },
    { status },
    { new: true },
  )
    .select({
      status: 1,
      _id: 0,
    })
    .exec();

  res.status(201).json(updatedInvoice);
};
