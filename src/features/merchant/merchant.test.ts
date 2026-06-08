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
import { Merchant } from '~/features/merchant/merchant.model.js';

describe('GET /api/v1/merchant', () => {
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

  test('Should be return merchant array', async () => {
    const merchant1 = await Merchant.create({
      feePercent: 0.1,
      name: 'merchant_1',
    });
    const merchant2 = await Merchant.create({
      feePercent: 0.35,
      name: 'merchant_2',
    });

    const app = buildApp();

    const actual = await request(app)
      .get('/api/v1/merchant/')
      .expect(200)
      .expect('Content-Type', /json/);

    const expected = [
      { merchantId: merchant1.externalId, feePercent: 0.1, name: 'merchant_1' },
      {
        merchantId: merchant2.externalId,
        feePercent: 0.35,
        name: 'merchant_2',
      },
    ];

    expect(actual.body).toEqual(expected);
  });
});

describe('POST /api/v1/merchant', () => {
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

  test('Should be return status 400 if merchant already exists', async () => {
    await Merchant.create({
      feePercent: 0.1234,
      name: 'merchant_1',
    });

    const newMerchantPayload = {
      feePercent: 0.11,
      name: 'merchant_1',
    };

    const app = buildApp();

    const actual = await request(app)
      .post('/api/v1/merchant/')
      .send(newMerchantPayload)
      .expect(400)
      .expect('Content-Type', /json/);

    expect(actual.body).toHaveProperty('error');
    expect(actual.body.error).toEqual('Merchant already exists');
  });

  test('Should be return status 400 and error if feePercent less than 0', async () => {
    const newMerchantPayload = {
      feePercent: -0.11,
      name: 'merchant_1',
    };

    const app = buildApp();

    const actual = await request(app)
      .post('/api/v1/merchant/')
      .send(newMerchantPayload)
      .expect(400)
      .expect('Content-Type', /json/);

    expect(actual.body).toHaveProperty('error');
  });

  test('Should be return status 400 and error if feePercent great than 1', async () => {
    const newMerchantPayload = {
      feePercent: 1.01,
      name: 'merchant_1',
    };

    const app = buildApp();

    const actual = await request(app)
      .post('/api/v1/merchant/')
      .send(newMerchantPayload)
      .expect(400)
      .expect('Content-Type', /json/);

    expect(actual.body).toHaveProperty('error');
  });

  test('Should be return status 400 and error if feePercent is greater than 4 decimal places', async () => {
    const newMerchantPayload = {
      feePercent: 1.01,
      name: 'merchant_1',
    };

    const app = buildApp();

    const actual = await request(app)
      .post('/api/v1/merchant/')
      .send(newMerchantPayload)
      .expect(400)
      .expect('Content-Type', /json/);

    expect(actual.body).toHaveProperty('error');
  });

  test('Should be create merchant', async () => {
    const newMerchantPayload = {
      feePercent: 0.11,
      name: 'merchant_1',
    };

    const app = buildApp();

    const actual = await request(app)
      .post('/api/v1/merchant/')
      .send(newMerchantPayload)
      .expect(201)
      .expect('Content-Type', /json/);

    expect(actual.body).toHaveProperty('merchantId');

    const createdMerchant = await Merchant.findOne({
      externalId: actual.body.merchantId,
    });

    expect(createdMerchant).not.toBeNull();
    expect(createdMerchant?.feePercent).toBe(newMerchantPayload.feePercent);
    expect(createdMerchant?.name).toBe(newMerchantPayload.name);
  });
});
