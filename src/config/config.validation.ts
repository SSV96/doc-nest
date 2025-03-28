import { z } from 'zod';

export const ConfigValidationSchema = z.object({
  NODE_ENV: z
    .enum(['local', 'development', 'staging', 'production'])
    .default('development'),

  PORT: z
    .string()
    .min(1, 'PORT is required')
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, {
      message: 'PORT must be a valid positive number',
    }),
});
