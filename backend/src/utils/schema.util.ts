import { z } from 'zod';

export const stringOrArray = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((val) => {
    if (!val) return undefined;
    if (typeof val === "string") return [val];
    return val;
  });