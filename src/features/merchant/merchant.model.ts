import { randomUUID } from 'node:crypto';

import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const MerchantSchema = new Schema({
  externalId: {
    type: String,
    default: () => randomUUID(),
    required: true,
    index: true,
  },
  feePercent: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
});

export const Merchant = mongoose.model('Merchant', MerchantSchema);
