import { createHmac, randomUUID } from 'node:crypto';

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import supertest from 'supertest';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from 'vitest';

import { buildApp } from '~/app.js';
import { Invoice } from '~/features/invoice/invoice.model.js';
import { Merchant } from '~/features/merchant/merchant.model.js';
import { redis } from '~/lib/redis.js';

describe('POST /api/v1/webhook', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    if (!redis.isOpen) {
      await redis.connect();
    }
  });
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    await redis.quit();
  });

  beforeEach(async () => {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
      if (!collections[key]) {
        continue;
      }
      await collections[key].deleteMany({});
    }
    await redis.flushDb();
  });

  test('Should be return 400, X-Signature is missing', async () => {
    const app = buildApp();

    const merchant = await Merchant.create({
      name: 'merchant',
      feePercent: 0.35,
    });

    const invoice = await Invoice.create({
      merchantId: merchant.externalId,
      amount: 1_000_000,
      fee: 350_000,
      amountToReceive: 750_000,
      status: 'pending',
      currency: 'RUB',
    });

    const xTimestamp = String(Date.now());
    const xNonce = randomUUID();
    const webhookPayload = {
      invoiceId: invoice.externalId,
      status: 'paid',
    };

    const actual = await supertest(app)
      .post('/api/v1/webhook')
      .set('X-Timestamp', xTimestamp)
      .set('X-Nonce', xNonce)
      .send(webhookPayload)
      .expect(400);

    const expected = {
      error: 'X-Signature is missing',
    };

    expect(actual.body).toEqual(expected);
  });

  test('Should be return 400, X-Timestamp is missing', async () => {
    const app = buildApp();
    const SECRET_KEY = process.env.SECRET_KEY || 'SECRET_KEY';
    const invoiceId = randomUUID();
    const body = {
      invoiceId,
      status: 'paid',
    };

    const hmac = createHmac('sha256', String(SECRET_KEY));
    hmac.update(JSON.stringify(body));

    const xSignature = hmac.digest('hex');

    const merchant = await Merchant.create({
      name: 'merchant',
      feePercent: 0.35,
    });

    const invoice = await Invoice.create({
      merchantId: merchant.externalId,
      amount: 1_000_000,
      fee: 350_000,
      amountToReceive: 750_000,
      status: 'pending',
      currency: 'RUB',
    });

    const xNonce = randomUUID();
    const webhookPayload = {
      invoiceId: invoice.externalId,
      status: 'paid',
    };

    const actual = await supertest(app)
      .post('/api/v1/webhook')
      .set('X-Signature', xSignature)
      .set('X-Nonce', xNonce)
      .send(webhookPayload)
      .expect(400);

    const expected = {
      error: 'X-Timestamp is missing',
    };

    expect(actual.body).toEqual(expected);
  });

  test('Should be return 400, X-Nonce is missing', async () => {
    const app = buildApp();
    const SECRET_KEY = process.env.SECRET_KEY || 'SECRET_KEY';
    const invoiceId = randomUUID();
    const body = {
      invoiceId,
      status: 'paid',
    };

    const hmac = createHmac('sha256', String(SECRET_KEY));
    hmac.update(JSON.stringify(body));

    const xSignature = hmac.digest('hex');

    const merchant = await Merchant.create({
      name: 'merchant',
      feePercent: 0.1,
    });

    const invoice = await Invoice.create({
      merchantId: merchant.externalId,
      amount: 2_000_000,
      fee: 200_000,
      amountToReceive: 1_800_000,
      status: 'pending',
      currency: 'RUB',
    });

    const xTimestamp = String(Date.now());
    const webhookPayload = {
      invoiceId: invoice.externalId,
      status: 'paid',
    };

    const actual = await supertest(app)
      .post('/api/v1/webhook')
      .set('X-Signature', xSignature)
      .set('X-Timestamp', xTimestamp)
      .send(webhookPayload)
      .expect(400);

    const expected = {
      error: 'X-Nonce is missing',
    };

    expect(actual.body).toEqual(expected);
  });

  test('Should be return 404, invoice not found', async () => {
    const app = buildApp();
    const SECRET_KEY = process.env.SECRET_KEY || 'SECRET_KEY';
    const invoiceId = randomUUID();

    const webhookPayload = {
      invoiceId: invoiceId,
      status: 'paid',
    };

    const hmac = createHmac('sha256', String(SECRET_KEY));
    hmac.update(JSON.stringify(webhookPayload));

    const xSignature = hmac.digest('hex');
    const xNonce = randomUUID();
    const xTimestamp = String(Date.now());

    const actual = await supertest(app)
      .post('/api/v1/webhook')
      .set('X-Signature', xSignature)
      .set('X-Timestamp', xTimestamp)
      .set('X-Nonce', xNonce)
      .send(webhookPayload)
      .expect(404);

    const expected = {
      error: 'Invoice not found',
    };

    expect(actual.body).toEqual(expected);
  });

  test('Should be return 400, invoice already paid', async () => {
    const app = buildApp();

    const merchant = await Merchant.create({
      name: 'merchant',
      feePercent: 0.1,
    });

    const invoice = await Invoice.create({
      merchantId: merchant.externalId,
      amount: 2_000_000,
      fee: 200_000,
      amountToReceive: 1_800_000,
      status: 'paid',
      currency: 'RUB',
    });

    const SECRET_KEY = process.env.SECRET_KEY || 'SECRET_KEY';
    const invoiceId = invoice.externalId;

    const webhookPayload = {
      invoiceId: invoiceId,
      status: 'paid',
    };

    const hmac = createHmac('sha256', String(SECRET_KEY));
    hmac.update(JSON.stringify(webhookPayload));

    const xSignature = hmac.digest('hex');
    const xNonce = randomUUID();
    const xTimestamp = String(Date.now());

    const actual = await supertest(app)
      .post('/api/v1/webhook')
      .set('X-Signature', xSignature)
      .set('X-Timestamp', xTimestamp)
      .set('X-Nonce', xNonce)
      .send(webhookPayload)
      .expect(400);

    const expected = {
      error: 'Invoice already paid',
    };

    expect(actual.body).toEqual(expected);
  });

  test('Should be return 401, invalid signature length', async () => {
    const app = buildApp();

    const merchant = await Merchant.create({
      name: 'merchant',
      feePercent: 0.1,
    });

    const invoice = await Invoice.create({
      merchantId: merchant.externalId,
      amount: 1_000_000,
      fee: 100_000,
      amountToReceive: 900_000,
      status: 'pending',
      currency: 'RUB',
    });

    const invoiceId = invoice.externalId;

    const webhookPayload = {
      invoiceId: invoiceId,
      status: 'paid',
    };

    const xSignature = 'string';
    const xNonce = randomUUID();
    const xTimestamp = String(Date.now());

    const actual = await supertest(app)
      .post('/api/v1/webhook')
      .set('X-Signature', xSignature)
      .set('X-Timestamp', xTimestamp)
      .set('X-Nonce', xNonce)
      .send(webhookPayload)
      .expect(401);

    const expected = {
      error: 'Invalid signature length',
    };

    expect(actual.body).toEqual(expected);
  });

  test('Should be return 401, invalid signature', async () => {
    const app = buildApp();

    const merchant = await Merchant.create({
      name: 'merchant',
      feePercent: 0.1,
    });

    const invoice = await Invoice.create({
      merchantId: merchant.externalId,
      amount: 1_000_000,
      fee: 100_000,
      amountToReceive: 900_000,
      status: 'pending',
      currency: 'RUB',
    });

    const SECRET_KEY = process.env.SECRET_KEY || 'SECRET_KEY';
    const invoiceId = invoice.externalId;

    const webhookPayload = {
      invoiceId: invoiceId,
      status: 'paid',
    };

    const hmac = createHmac('sha256', String(SECRET_KEY));
    hmac.update(
      JSON.stringify({
        invoiceId: randomUUID(),
        status: 'paid',
      }),
    );

    const xSignature = hmac.digest('hex');
    const xNonce = randomUUID();
    const xTimestamp = String(Date.now());

    const actual = await supertest(app)
      .post('/api/v1/webhook')
      .set('X-Signature', xSignature)
      .set('X-Timestamp', xTimestamp)
      .set('X-Nonce', xNonce)
      .send(webhookPayload)
      .expect(401);

    const expected = {
      error: 'Invalid signature',
    };

    expect(actual.body).toEqual(expected);
  });

  test('Should be return 401, invalid or expired timestamp', async () => {
    const app = buildApp();

    const merchant = await Merchant.create({
      name: 'merchant',
      feePercent: 0.1,
    });

    const invoice = await Invoice.create({
      merchantId: merchant.externalId,
      amount: 1_000_000,
      fee: 100_000,
      amountToReceive: 900_000,
      status: 'pending',
      currency: 'RUB',
    });

    const SECRET_KEY = process.env.SECRET_KEY;
    const invoiceId = invoice.externalId;

    const webhookPayload = {
      invoiceId: invoiceId,
      status: 'paid',
    };

    const xSignature = createHmac('sha256', String(SECRET_KEY))
      .update(JSON.stringify(webhookPayload))
      .digest('hex');
    const xNonce = randomUUID();
    const xTimestamp = String(Date.now() - 6 * 60 * 1000);

    const actual = await supertest(app)
      .post('/api/v1/webhook')
      .set('X-Signature', xSignature)
      .set('X-Timestamp', xTimestamp)
      .set('X-Nonce', xNonce)
      .send(webhookPayload)
      .expect(401);

    const expected = {
      error: 'Invalid or expired timestamp',
    };

    expect(actual.body).toEqual(expected);
  });

  test('Should be return 200, status - paid', async () => {
    const app = buildApp();
    const merchant = await Merchant.create({
      name: 'merchant',
      feePercent: 0.1,
    });

    const invoice = await Invoice.create({
      merchantId: merchant.externalId,
      amount: 1_000_000,
      fee: 100_000,
      amountToReceive: 900_000,
      status: 'pending',
      currency: 'RUB',
    });

    const SECRET_KEY = process.env.SECRET_KEY;
    const invoiceId = invoice.externalId;

    const webhookPayload = {
      invoiceId: invoiceId,
      status: 'paid',
    };

    const xSignature = createHmac('sha256', String(SECRET_KEY))
      .update(JSON.stringify(webhookPayload))
      .digest('hex');
    const xNonce = randomUUID();
    const xTimestamp = String(Date.now() - 2 * 60 * 1000);

    const actual = await supertest(app)
      .post('/api/v1/webhook')
      .set('X-Signature', xSignature)
      .set('X-Timestamp', xTimestamp)
      .set('X-Nonce', xNonce)
      .send(webhookPayload)
      .expect(201);

    const expected = {
      status: 'paid',
    };

    expect(actual.body).toEqual(expected);
  });

  test('Should be return 401, nonce not unique', async () => {
    const app = buildApp();
    const merchant = await Merchant.create({
      name: 'merchant',
      feePercent: 0.1,
    });

    const invoice = await Invoice.create({
      merchantId: merchant.externalId,
      amount: 1_000_000,
      fee: 100_000,
      amountToReceive: 900_000,
      status: 'pending',
      currency: 'RUB',
    });

    const SECRET_KEY = process.env.SECRET_KEY;
    const invoiceId = invoice.externalId;

    const webhookPayload = {
      invoiceId: invoiceId,
      status: 'paid',
    };

    const xSignature = createHmac('sha256', String(SECRET_KEY))
      .update(JSON.stringify(webhookPayload))
      .digest('hex');
    const xNonce = randomUUID();
    const xTimestamp = String(Date.now() - 4 * 60 * 1000);

    await redis.set(xNonce, xNonce);

    const actual = await supertest(app)
      .post('/api/v1/webhook')
      .set('X-Signature', xSignature)
      .set('X-Timestamp', xTimestamp)
      .set('X-Nonce', xNonce)
      .send(webhookPayload)
      .expect(401);

    const expected = {
      error: 'Nonce not unique',
    };

    expect(actual.body).toEqual(expected);
  });
});
