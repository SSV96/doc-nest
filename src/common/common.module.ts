import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { PostgresModule } from './postgres/postgres.module';

@Module({
  imports: [ConfigModule, PostgresModule],
  exports: [ConfigModule, PostgresModule],
})
export class CommonModule {}
