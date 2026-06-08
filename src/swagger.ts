import swaggerAutogen from 'swagger-autogen';

const doc = {
  openapi: '3.0.0',
  info: {
    title: 'Payment service API',
    description: 'API description',
    version: '1.0.0',
  },
  host: '127.0.0.1:3000',
  components: {
    schemas: {
      WebhookRequestBodySchema: {
        $invoiceId: '2464eef0-6e67-4e08-b3ab-4422a7a0bcf6',
        $status: 'paid',
      },
      WebhookResponseBodySchema: {
        status: 'paid',
      },
      ErrorSchema: {
        error: 'description',
      },
      CreateMerchantRequestBodySchema: {
        $feePercent: 0.1224,
        $name: 'merchant_4',
      },
      CreateMerchantResponseBodySchema: {
        merchantId: '2464eef0-6e67-4e08-b3ab-4422a7a0bcf6',
        name: 'merchant_4',
        feePercent: 0.1224,
      },
      GetMerchantsResponseBodySchema: [
        {
          merchantId: '2464eef0-6e67-4e08-b3ab-4422a7a0bcf6',
          name: 'merchant_4',
          feePercent: 0.1224,
        },
      ],
      CreateInvoiceRequestBodySchema: {
        merchantId: '9232af0c-508d-402c-8fc8-08570a7ff5e1',
        currency: 'RUB',
        amount: 1_000_000,
      },
      CreateInvoiceResponseBodySchema: {
        invoiceId: '4158e099-b4b2-46d7-9d34-3afe735ca5c6',
        amountToReceive: 877_600,
        fee: 122_400,
      },
      GetInvoiceStatusByIdResponseBodySchema: {
        status: 'paid',
      },
    },
  },
};

const outputFile = './src/swagger.json';
const routes = ['./src/app.ts'];

swaggerAutogen({ openapi: '3.0.0' })(outputFile, routes, doc);
