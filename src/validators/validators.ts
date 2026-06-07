import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodType } from 'zod';

const createValidator = (key: 'body' | 'query' | 'params') => {
  return function validate<T>(schema: ZodType<T>) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        schema.parse(req[key]);
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          res.status(400).json({ error: error.message });
          throw new Error(error.message, {
            cause: error,
          });
        }
        throw error;
      }
    };
  };
};

export const bodyValidator = createValidator('body');
export const queryValidator = createValidator('query');
export const paramsValidator = createValidator('params');
