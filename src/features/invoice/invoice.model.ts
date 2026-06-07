import { randomUUID } from 'node:crypto';

import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const InvoiceSchema = new Schema({
  externalId: {
    type: String,
    default: () => randomUUID(),
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  amountToReceive: {
    type: Number,
    required: true,
  },
  fee: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  merchantId: {
    type: String,
    required: true,
    ref: 'merchant',
  },
});

export const Invoice = mongoose.model('Invoice', InvoiceSchema);
