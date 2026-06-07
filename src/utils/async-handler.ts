import type { NextFunction, Request, Response } from 'express';

type ParamsDictionary = {
  [key: string]: string | string[];
  [key: number]: string;
};

type ParsedQs = {
  [key: string]: undefined | string | ParsedQs | (string | ParsedQs)[];
};

export function asyncHandler<
  P = ParamsDictionary,
  ResponseBody = unknown,
  RequestBody = unknown,
  RequestQuery = ParsedQs,
  LocalsObject extends Record<string, unknown> = Record<string, unknown>,
>(
  function_: (
    request: Request<P, ResponseBody, RequestBody, RequestQuery, LocalsObject>,
    response: Response<ResponseBody, LocalsObject>,
  ) => Promise<void>,
): (
  request: Request<P, ResponseBody, RequestBody, RequestQuery, LocalsObject>,
  response: Response<ResponseBody, LocalsObject>,
  next: NextFunction,
) => Promise<void> {
  return async (
    request: Request<P, ResponseBody, RequestBody, RequestQuery, LocalsObject>,
    response: Response<ResponseBody, LocalsObject>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await function_(request, response);
    } catch (error) {
      next(error);
    }
  };
}
