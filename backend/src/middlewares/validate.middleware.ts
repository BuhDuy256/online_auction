import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

type RequestSource = 'body' | 'query' | 'params';

export const validate = (schema: z.ZodObject<any>, source: RequestSource = 'body') => (req: Request, _res: Response, next: NextFunction) => {
  try {
    const dataToValidate = req[source];
    const parsedData = schema.parse(dataToValidate);
    req[source] = parsedData;
    return next();
  } catch (error) {
    if (error instanceof ZodError) {
      return next(error);
    }
    next(error);
  }
};
