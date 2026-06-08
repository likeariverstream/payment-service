import { Router } from 'express';

import { webhookHandler } from '~/features/webhook/webhook.handler.js';
import { webhookBodySchema } from '~/features/webhook/webhook.schema.js';
import { asyncHandler } from '~/utils/async-handler.js';
import { bodyValidator } from '~/validators/validators.js';

export const webhookRouter = Router();

webhookRouter.post(
  /*
#swagger.tags = ['Webhook']
#swagger.summary = 'Прием статуса оплаты'
#swagger.description = 'Заголовки обязательны, окно толерантности для X-Timestamp - 5 минут'
#swagger.parameters['X-Signature'] = { in: 'header', required: true, type: 'string' }
#swagger.parameters['X-Nonce] = { in: 'header', required: true, type: 'string' }
#swagger.parameters['X-Timestamp] = { in: 'header', required: true, type: 'string' }
#swagger.requestBody = {
  required: true,
  schema: { $ref: '#/components/schemas/WebhookRequestBodySchema' }
}
*/

  /* #swagger.responses[200] = {
       content: {
           "application/json": {
               schema:{
                   $ref: "#/components/schemas/WebhookResponseBodySchema"
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
  /* #swagger.responses[401] = {
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

  /* #swagger.responses[404] = {
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
  bodyValidator(webhookBodySchema),
  asyncHandler(webhookHandler),
);
