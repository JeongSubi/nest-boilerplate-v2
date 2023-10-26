import {
  CopyObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  GetSecretValueCommand,
  GetSecretValueCommandOutput,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import {
  createPresignedPost,
  PresignedPost,
  PresignedPostOptions,
} from '@aws-sdk/s3-presigned-post';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface AwsConfig {
  secrets: {
    service: string;
  };
  region: string;
  tempBucket: string;
  bucket: string;
  bucketPath: string;
  cloudfront: string;
}

@Injectable()
export class AwsService {
  private readonly awsConfig: AwsConfig;
  private readonly s3Client: S3Client;
  private readonly secretsManagerClient: SecretsManagerClient;

  constructor(private configService: ConfigService) {
    this.awsConfig = this.configService.get<AwsConfig>('aws', { infer: true });
    this.s3Client = new S3Client({ region: this.awsConfig.region });
    this.secretsManagerClient = new SecretsManagerClient({ region: this.awsConfig.region });
  }

  async getSecretValue(secretName: string): Promise<any> {
    try {
      const command: GetSecretValueCommand = new GetSecretValueCommand({ SecretId: secretName });
      const data: GetSecretValueCommandOutput = await this.secretsManagerClient.send(command);
      if (data.SecretString) {
        try {
          return JSON.parse(data.SecretString);
        } catch (error) {
          return data.SecretString;
        }
      }
      throw new Error('NoSecretString');
    } catch (error) {
      throw error;
    }
  }

  async copyTempObject(path: string, prefix: string = ''): Promise<string> {
    if (!path) throw new BadRequestException('path_required');

    try {
      const url: URL = new URL(path);

      return decodeURIComponent(url.href).normalize('NFC');
    } catch (error) {
      try {
        let copySource;
        let targetKey;

        const pathSplit = path.split('/');
        if (pathSplit.length > 1) {
          const [prePath, fileName] = pathSplit;
          copySource = `${prePath}/${encodeURIComponent(fileName.normalize('NFC'))}`;
          targetKey = `${prefix}/${fileName}`;
        } else {
          copySource = encodeURIComponent(path);
          targetKey = `${prefix}/${path}`;
        }

        const command: CopyObjectCommand = new CopyObjectCommand({
          Bucket: this.awsConfig.bucket,
          CopySource: `${this.awsConfig.tempBucket}/${copySource}`,
          Key: `${this.awsConfig.bucketPath}${targetKey.normalize('NFC')}`,
          CacheControl: 'max-age=31536000',
        });

        await this.s3Client.send(command);

        return `${this.awsConfig.cloudfront}/${targetKey}`;
      } catch (error) {
        error.status = error.statusCode;

        if (error.status === 404) throw new NotFoundException(`s3: ${path} not found`);

        throw error;
      }
    }
  }

  async getS3Metadata(path: string, forCloudfront?: boolean) {
    if (!path) throw new BadRequestException('path_required');

    try {
      const key: string = forCloudfront
        ? path.replace(`${this.awsConfig.cloudfront}/`, this.awsConfig.bucketPath)
        : path;

      const command = new HeadObjectCommand({
        Bucket: this.awsConfig.bucket,
        Key: key,
      });

      return await this.s3Client.send(command);
    } catch (error) {
      if (error.name === 'NotFound') {
        throw new NotFoundException(`s3: ${path} not found`);
      }
      throw error;
    }
  }

  async generatePreSignedUrl(
    type: 'IMAGE' | 'FILE',
    key: string,
    imageDimension?: {
      width: number;
      height: number;
    },
  ): Promise<{ path: string; url: string; fields: Record<string, string> }> {
    if (type === 'IMAGE' && (!imageDimension?.width || !imageDimension?.height))
      throw new BadRequestException('dimension_required');

    const normalizedKey: string = key.normalize('NFC');
    const conditions: PresignedPostOptions['Conditions'] = [
      ['content-length-range', 0, 2 * 1024 * 1024],
    ];
    const fields: PresignedPostOptions['Fields'] = {};

    if (type === 'IMAGE') {
      conditions.push(['starts-with', '$Content-Type', 'image/']);
      fields['x-amz-meta-width'] = imageDimension.width.toString();
      fields['x-amz-meta-height'] = imageDimension.height.toString();
    }

    const presignedPost: PresignedPost = await createPresignedPost(this.s3Client, {
      Bucket: this.awsConfig.tempBucket,
      Key: normalizedKey,
      Conditions: conditions,
      Fields: fields,
      Expires: 3600,
    });

    return { path: normalizedKey, url: presignedPost.url, fields: presignedPost.fields };
  }

  async getS3Object(bucket: string, key: string): Promise<any> {
    const command: GetObjectCommand = new GetObjectCommand({ Bucket: bucket, Key: key });

    return await this.s3Client.send(command);
  }
}
