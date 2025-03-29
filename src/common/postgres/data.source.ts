import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv-flow';
dotenv.config({ silent: true });

export const dbdatasource: DataSourceOptions = {
  type: 'postgres',
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  username: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  synchronize: false,
  entities: [],
  migrations: ['dist/common/postgres/migrations/*.js'],
};

const dataSource = new DataSource(dbdatasource);
export default dataSource;
