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

  //postgres credentials
  PG_HOST: z.string(),
  PG_DATABASE: z.string(),
  PG_USER: z.string(),
  PG_PASSWORD: z.string(),
  PG_PORT: z.coerce.number().positive(),

  // Jwt
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string(),

  //Aws
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_REGION: z.string(),
  AWS_BUCKET_NAME: z.string(),

  //Ingestion
  INGESTION_SERVICE_URL: z.string(),
});
