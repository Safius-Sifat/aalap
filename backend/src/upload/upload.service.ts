import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

type UploadResult = {
    key: string;
    url: string;
};

@Injectable()
export class UploadService {
    private readonly client: S3Client;
    private readonly bucketName: string;
    private readonly publicBaseUrl: string;

    constructor(private readonly configService: ConfigService) {
        const accountId = this.mustGet('R2_ACCOUNT_ID');
        const accessKeyId = this.mustGet('R2_ACCESS_KEY_ID');
        const secretAccessKey = this.mustGet('R2_SECRET_ACCESS_KEY');

        const endpoint =
            this.configService.get<string>('R2_ENDPOINT') ??
            `https://${accountId}.r2.cloudflarestorage.com`;

        this.client = new S3Client({
            region: this.configService.get<string>('R2_REGION') ?? 'auto',
            endpoint,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });

        this.bucketName = this.mustGet('R2_BUCKET_NAME');
        this.publicBaseUrl = this.mustGet('R2_PUBLIC_URL').replace(/\/+$/, '');
    }

    async uploadPublicFile(
        buffer: Buffer,
        contentType: string,
        folder: string,
        originalFilename: string,
    ): Promise<UploadResult> {
        const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
        const filename = `${Date.now()}-${randomUUID()}-${this.sanitizeFilename(originalFilename)}`;
        const key = `${cleanFolder}/${filename}`;

        await this.client.send(
            new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: buffer,
                ContentType: contentType,
            }),
        );

        return {
            key,
            url: `${this.publicBaseUrl}/${key}`,
        };
    }

    private sanitizeFilename(name: string): string {
        return name
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^a-zA-Z0-9._-]/g, '');
    }

    private mustGet(key: string): string {
        const value = this.configService.get<string>(key);
        if (!value) {
            throw new Error(`Missing required environment variable: ${key}`);
        }
        return value;
    }
}
