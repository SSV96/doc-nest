import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv-flow';
import { User } from '../../users/entities/user.entity';
import { Documents } from '../../documents/entities/documents.entity';
dotenv.config({ silent: true });

export const dbdatasource: DataSourceOptions = {
  type: 'postgres',
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  username: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  synchronize: process.env.NODE_ENV === 'local' ? true : false,
  entities: [User, Documents],
  migrations: ['dist/common/postgres/migrations/*.js'],
};

const dataSource = new DataSource(dbdatasource);
export default dataSource;
