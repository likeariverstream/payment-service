import { Router } from 'express';

import { createInvoiceHandler } from '~/features/invoice/create-invoice.handler.js';
import { getInvoiceStatusByIdHandler } from '~/features/invoice/get-invoice-status-by-id.handler.js';
import {
  createInvoiceBodySchema,
  getInvoiceParamsSchema,
} from '~/features/invoice/invoice.schema.js';
import { asyncHandler } from '~/utils/async-handler.js';
import { bodyValidator, paramsValidator } from '~/validators/validators.js';

export const invoiceRouter = Router();

invoiceRouter.post(
  /*
#swagger.tags = ['Invoice']
#swagger.summary = 'Создание счета'
#swagger.description = 'Сумма передается в минимальных разменных денежных единицах, поддерживаемые типы валют - RUB, USD'
#swagger.requestBody = {
  required: true,
  schema: { $ref: '#/components/schemas/CreateInvoiceRequestBodySchema' }
}
  */

  /* #swagger.responses[201] = {
 description: "Возвращает id счета, комиссию и сумму к зачислению"
 content: {
     "application/json": {
         schema:{
             $ref: "#/components/schemas/CreateInvoiceResponseBodySchema"
         }
     }
 }
}
*/
  /* #swagger.responses[400] = {
     content: {
         "application/json": {
             schema:{
                 $ref: "#/components/schemas/ErrorSchema"
             }
         }
     }
    }
*/
  /* #swagger.responses[404] = {
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
  bodyValidator(createInvoiceBodySchema),
  asyncHandler(createInvoiceHandler),
);
invoiceRouter.get(
  /*
#swagger.tags = ['Invoice']
#swagger.summary = 'Получение счета на оплату'
*/
  /*
#swagger.parameters['id'] = {
       description: 'id счета',
       required: tru,
       type: string,
  }
*/
  /*
#swagger.responses[200] = {
   description: "Возвращает статус счета"
   content: {
       "application/json": {
           schema:{
               $ref: "#/components/schemas/GetInvoiceStatusByIdResponseBodySchema"
           }
       }
   }
  }
*/
  /*
#swagger.responses[404] = {
   content: {
       "application/json": {
           schema:{
               $ref: "#/components/schemas/ErrorSchema"
           }
       }
   }
}
*/

  '/:id',
  paramsValidator(getInvoiceParamsSchema),
  asyncHandler(getInvoiceStatusByIdHandler),
);
