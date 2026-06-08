import { Router } from 'express';

import { createMerchantHandler } from '~/features/merchant/create-merchant.handler.js';
import { getMerchantsHandler } from '~/features/merchant/get-merchants.handler.js';
import {
  createMerchantBodySchema,
  getMerchantsQuerySchema,
} from '~/features/merchant/merchant.schema.js';
import { asyncHandler } from '~/utils/async-handler.js';
import { bodyValidator, queryValidator } from '~/validators/validators.js';

export const merchantRouter = Router();

merchantRouter.post(
  /*
#swagger.tags = ['Merchant']
#swagger.summary = 'Создание мерчанта'
#swagger.description = 'Имя должно быть уникальным, процент комиссии - число от 0 до 1, до 4 знаков после запятой'
#swagger.requestBody = {
  required: true,
  schema: { $ref: '#/components/schemas/CreateMerchantRequestBodySchema' }
}
*/
  /* #swagger.responses[200] = {
     content: {
         "application/json": {
             schema:{
                 $ref: "#/components/schemas/CreateMerchantResponseBodySchema"
             }
         }
     }
 }
*/

  /* #swagger.responses[400] = {
 description: "Some description...",
 content: {
     "application/json": {
         schema:{
             $ref: "#/components/schemas/ErrorSchema"
         }
     }
 }
}
*/

  '/',
  bodyValidator(createMerchantBodySchema),
  asyncHandler(createMerchantHandler),
);
merchantRouter.get(
  /*
 #swagger.tags = ['Merchant']
#swagger.summary = 'Получение списка мерчантов'
#swagger.description = 'По умолчанию page = 1, perPage = 50'
#swagger.parameters['page'] = {
  in: 'query',
  type: 'number',
}
#swagger.parameters['perPage'] = {
  in: 'query',
  type: 'number',
}
*/

  /* #swagger.responses[200] = {
     description: "Some description...",
     content: {
         "application/json": {
             schema:{
                 $ref: "#/components/schemas/GetMerchantsResponseBodySchema"
             }
         }
     }
 }
*/
  '/',
  queryValidator(getMerchantsQuerySchema),
  asyncHandler(getMerchantsHandler),
);
