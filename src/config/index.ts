import { ConfigValidationSchema } from './config.validation';

const config = (config: Record<string, unknown>) => {
  const ENVS = ConfigValidationSchema.parse(config);
  return {
    app: {
      appName: 'nest-js-backend',
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
  } as const;
};

export type ConfigVariablesType = ReturnType<typeof config>;

export default config;
