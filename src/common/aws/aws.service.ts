import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Inject } from '@nestjs/common';

import { ConfigVariablesType } from '../../config';
import { v4 as uuid } from 'uuid';
export class AwsService {
  constructor(
    @Inject('S3_CLIENT') private readonly s3: S3Client,
    @Inject('S3_CONFIG')
    private readonly S3Config: ConfigVariablesType['aws']['s3'],
  ) {}

  private extractFileKeyFromUrl(url: string, bucketName: string) {
    const urlObj = new URL(url);
    return urlObj.pathname.replace(`/${bucketName}/`, '');
  }

  async generatePreSignedUrl(
    fileName: string,
    fileType: string,
  ): Promise<string> {
    const key = `documents/${uuid()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.S3Config.bucketName,
      Key: key,
      ContentType: fileType,
    });

    const url = getSignedUrl(this.s3, command, { expiresIn: 3600 });

    return url;
  }

  async uploadToS3(file: Express.Multer.File) {
    const { bucketName } = this.S3Config;
    const fileKey = `documents/${uuid()}-${file.originalname}`;

    // Upload file to S3
    await this.s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );
    const url = `https://${bucketName}.s3.amazonaws.com/${fileKey}`;
    return url;
  }

  async deleteFromS3(url: string) {
    const { bucketName } = this.S3Config;
    const fileKey = this.extractFileKeyFromUrl(url, bucketName);
    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: fileKey,
        }),
      );
      return { success: true, message: 'File deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }
}
