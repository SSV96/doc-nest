import { ConfigValidationSchema } from './config.validation';

const config = (config: Record<string, unknown>) => {
  const ENVS = ConfigValidationSchema.parse(config);
  return {
    app: {
      appName: 'doc-nest',
      env: ENVS.NODE_ENV,
      port: ENVS.PORT,
    },
    db: {
      postgres: {
        host: ENVS.PG_HOST,
        dbName: ENVS.PG_DATABASE,
        username: ENVS.PG_USER,
        password: ENVS.PG_PASSWORD,
        port: ENVS.PG_PORT,
      },
    },
    jwt: {
      secret: ENVS.JWT_SECRET,
      expiresIn: ENVS.JWT_EXPIRES_IN,
    },
    aws: {
      accessKeyId: ENVS.AWS_ACCESS_KEY_ID,
      secretAccessKey: ENVS.AWS_SECRET_ACCESS_KEY,

      s3: {
        region: ENVS.AWS_REGION,
        bucketName: ENVS.AWS_BUCKET_NAME,
      },
    },
  } as const;
};

export type ConfigVariablesType = ReturnType<typeof config>;

export default config;
