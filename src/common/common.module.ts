import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { PostgresModule } from './postgres/postgres.module';
import { AwsModule } from './aws/aws.module';

@Module({
  imports: [ConfigModule, PostgresModule, AwsModule],
  exports: [ConfigModule, PostgresModule, AwsModule],
})
export class CommonModule {}
