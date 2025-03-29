import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const { host, port, username, password, dbName } =
          configService.get('db.postgres');

        return {
          type: 'postgres',
          host,
          port,
          username,
          password,
          database: dbName,
          autoLoadEntities: true,
          synchronize: false,
        };
      },
    }),
  ],
})
export class PostgresModule {}
