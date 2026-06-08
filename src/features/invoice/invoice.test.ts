import { randomUUID } from 'node:crypto';

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
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

describe('POST /api/v1/invoice', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
      if (!collections[key]) {
        continue;
      }
      await collections[key].deleteMany({});
    }
  });

  test('Should be create correct invoice', async () => {
    const app = buildApp();

    const merchant = await Merchant.create({
      name: 'merchant',
      feePercent: 0.25,
    });

    const createInvoicePayload = {
      merchantId: merchant.externalId,
      currency: 'RUB',
      amount: 1_000_000,
    };

    const actual = await request(app)
      .post('/api/v1/invoice/')
      .send(createInvoicePayload)
      .expect(201)
      .expect('Content-Type', /json/);

    const invoice = await Invoice.findOne({
      externalId: actual.body.invoiceId,
    });

    expect(invoice).not.toBeNull();

    const expected = {
      invoiceId: invoice?.externalId,
      amountToReceive: 750_000,
      fee: 250_000,
    };

    expect(actual.body).toEqual(expected);
  });

  test('Should be return 404, merchant not found', async () => {
    const app = buildApp();

    const createInvoicePayload = {
      merchantId: randomUUID(),
      currency: 'RUB',
      amount: 1_000_000,
    };

    const actual = await request(app)
      .post('/api/v1/invoice/')
      .send(createInvoicePayload)
      .expect(404)
      .expect('Content-Type', /json/);

    const expected = {
      error: 'Merchant not found',
    };

    expect(actual.body).toEqual(expected);
  });

  test('Should be return 400, currency not supported', async () => {
    const app = buildApp();

    const createInvoicePayload = {
      merchantId: randomUUID(),
      currency: 'EUR',
      amount: 1_000_000,
    };

    const actual = await request(app)
      .post('/api/v1/invoice/')
      .send(createInvoicePayload)
      .expect(404)
      .expect('Content-Type', /json/);

    const expected = {
      error: 'Merchant not found',
    };

    expect(actual.body).toEqual(expected);
  });

  test('Should be return 400, amount less than 0', async () => {
    const app = buildApp();

    const createInvoicePayload = {
      merchantId: randomUUID(),
      currency: 'EUR',
      amount: -1,
    };

    const actual = await request(app)
      .post('/api/v1/invoice/')
      .send(createInvoicePayload)
      .expect(400)
      .expect('Content-Type', /json/);

    expect(actual.body).toHaveProperty('error');
  });
});

describe('/api/v1/invoice/:id', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
      if (!collections[key]) {
        continue;
      }
      await collections[key].deleteMany({});
    }
  });
  test('Should be return 404, invoice not found', async () => {
    const app = buildApp();

    const invoiceId = randomUUID();

    const actual = await request(app)
      .get(`/api/v1/invoice/${invoiceId}`)
      .send({
        invoiceId,
      })
      .expect(404);

    const expected = {
      error: 'Invoice not found',
    };

    expect(actual.body).toEqual(expected);
  });

  test('Should be return invoice status', async () => {
    const app = buildApp();
    const merchant = await Merchant.create({
      name: 'merchant_11',
      feePercent: 0.4,
    });
    const invoice = await Invoice.create({
      merchantId: merchant.externalId,
      amount: 50_000_000,
      amountToReceive: 3_000_000,
      fee: 2_000_000,
      currency: 'USD',
      status: 'pending',
    });
    const invoiceId = invoice.externalId;

    const actual = await request(app)
      .get(`/api/v1/invoice/${invoiceId}`)
      .send({
        invoiceId,
      })
      .expect(200);

    const expected = {
      status: 'pending',
    };

    expect(actual.body).toEqual(expected);
  });
});
