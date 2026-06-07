import { createHmac, randomUUID } from 'node:crypto';

import supertest from 'supertest';
import { describe, expect, test } from 'vitest';

import { buildApp } from '~/app.js';

describe(`/api/v1/webhook`, () => {
  test('POST /api/v1/webhook`', async () => {
    const app = buildApp();
    const SECRET_KEY = process.env.SECRET_KEY;
    const invoiceId = randomUUID();
    const body = {
      invoiceId,
      status: 'paid',
    };

    const hmac = createHmac('sha256', String(SECRET_KEY));
    hmac.update(JSON.stringify(body));

    const xSignature = hmac.digest('hex');
    const xTimestamp = String(Date.now());
    const xNonce = randomUUID();

    const expected = {
      status: 'paid',
      invoiceId: invoiceId,
      xSignature,
      xTimestamp,
      xNonce,
    };

    const actual = await supertest(app)
      .post('/api/v1/webhook')
      .set('X-Signature', xSignature)
      .set('X-Timestamp', xTimestamp)
      .set('X-Nonce', xNonce)
      .send(expected)
      .expect(201);

    expect(actual.body).toEqual(expected);
  });
});
