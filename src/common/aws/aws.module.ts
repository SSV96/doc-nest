import { Module } from '@nestjs/common';
import { AwsService } from './aws.service';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';

@Module({
  providers: [
    {
      provide: 'S3_CLIENT',
      useFactory: (configService: ConfigService) => {
        return new S3Client({
          region: configService.get<string>('aws.region'),
          credentials: {
            accessKeyId: configService.get<string>('aws.accessKeyId'),
            secretAccessKey: configService.get<string>('aws.secretAccessKey'),
          },
        });
      },
      inject: [ConfigService],
    },
    {
      provide: 'S3_CONFIG',
      useFactory: (configService: ConfigService) => {
        return configService.get('aws.s3');
      },
      inject: [ConfigService],
    },
    AwsService,
  ],
  exports: [AwsService],
})
export class AwsModule {}
