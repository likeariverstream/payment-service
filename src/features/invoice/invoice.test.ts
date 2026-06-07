import { randomUUID } from 'node:crypto';

import request from 'supertest';
import { describe, expect, test } from 'vitest';

import { buildApp } from '~/app.js';

describe('/api/v1/invoice', () => {
  test('POST /api/v1/invoice', async () => {
    const app = buildApp();

    const invoiceId = '68094a3d-d57c-461e-92f6-5224b8de1f52';

    const invoice = {
      invoiceId: invoiceId,
      amountToReceive: 1000,
      fee: 20,
    };

    const actual = await request(app)
      .post('/api/v1/invoice/')
      .send(invoice)
      .expect(200)
      .expect('Content-Type', /json/);

    const expected = {
      invoiceId: invoiceId,
      amountToReceive: 1000,
      fee: 20,
    };

    expect(actual.body).toEqual(expected);
  });
});

describe('/api/v1/invoice/:id', () => {
  test('GET /api/v1/invoice/:id', async () => {
    const app = buildApp();

    const invoiceId = randomUUID();
    const actual = await request(app)
      .get(`/api/v1/invoice/${invoiceId}`)
      .send({
        invoiceId,
      })
      .expect(200);

    const expected = {
      invoiceId: invoiceId,
      status: 'pending',
    };

    expect(actual.body).toEqual(expected);
  });
});
