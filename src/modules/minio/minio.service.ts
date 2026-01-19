import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { Readable } from 'stream';

export interface MinioUploadResult {
    /**
     * The full URL to access the uploaded file
     */
    url: string;

    /**
     * The bucket name where the file was uploaded
     */
    bucket: string;

    /**
     * The object path within the bucket
     */
    objectPath: string;

    /**
     * The original filename
     */
    fileName: string;

    /**
     * File size in bytes
     */
    fileSize: number;

    /**
     * MIME type of the file
     */
    contentType: string;

    /**
     * ETag returned by MinIO
     */
    etag: string;

    /**
     * Upload timestamp
     */
    uploadedAt: Date;
}

export interface MinioUploadOptions {
    /**
     * Custom metadata to attach to the file
     */
    metadata?: Record<string, string>;

    /**
     * Content type override (if not provided, will be inferred from file)
     */
    contentType?: string;

    /**
     * Whether to make the file publicly accessible
     * @default false
     */
    isPublic?: boolean;
}

@Injectable()
export class MinioService {
    private readonly logger = new Logger(MinioService.name);
    private readonly minioClient: Minio.Client;
    private readonly minioPresignClient: Minio.Client; // Separate client for presigned URLs
    private readonly endpoint: string;
    private readonly port: number;
    private readonly useSSL: boolean;
    private readonly publicUrl: string;

    constructor(private readonly configService: ConfigService) {
        this.endpoint = this.configService.get<string>('MINIO_ENDPOINT', 'localhost');
        this.port = parseInt(this.configService.get<string>('MINIO_PORT', '9000'), 10);
        // Parse boolean from string environment variable
        const useSslEnv = this.configService.get<string>('MINIO_USE_SSL', 'false');
        this.useSSL = useSslEnv === 'true' || useSslEnv === '1';

        const accessKey = this.configService.get<string>('MINIO_ACCESS_KEY');
        const secretKey = this.configService.get<string>('MINIO_SECRET_KEY');

        if (!accessKey || !secretKey) {
            throw new Error('MinIO credentials not configured. Please set MINIO_ACCESS_KEY and MINIO_SECRET_KEY environment variables.');
        }

        // Create main client for operations (using internal Docker endpoint)
        this.minioClient = new Minio.Client({
            endPoint: this.endpoint,
            port: this.port,
            useSSL: this.useSSL,
            accessKey,
            secretKey,
        });

        // Use MINIO_PUBLIC_URL if provided, otherwise construct from endpoint
        // This allows different URLs for internal (Docker) and external (browser) access
        const publicUrlConfig = this.configService.get<string>('MINIO_PUBLIC_URL');
        if (publicUrlConfig) {
            this.publicUrl = publicUrlConfig;
        } else {
            const protocol = this.useSSL ? 'https' : 'http';
            this.publicUrl = `${protocol}://${this.endpoint}:${this.port}`;
        }

        // Create separate client for presigned URLs using public endpoint
        // This ensures signatures are valid when accessed from external URLs
        if (publicUrlConfig) {
            try {
                const url = new URL(publicUrlConfig);
                const presignEndpoint = url.hostname;
                const presignPort = url.port ? parseInt(url.port, 10) : (url.protocol === 'https:' ? 443 : 80);
                const presignUseSSL = url.protocol === 'https:';
                
                this.minioPresignClient = new Minio.Client({
                    endPoint: presignEndpoint,
                    port: presignPort,
                    useSSL: presignUseSSL,
                    accessKey,
                    secretKey,
                });
                
                this.logger.log(`Using public URL for presigned URLs: ${presignEndpoint}:${presignPort} (SSL: ${presignUseSSL})`);
            } catch (error) {
                this.logger.warn(`Failed to parse MINIO_PUBLIC_URL, using internal client for presigned URLs: ${error.message}`);
                this.minioPresignClient = this.minioClient;
            }
        } else {
            // If no public URL, use the same client
            this.minioPresignClient = this.minioClient;
        }

        this.logger.log(`MinIO client initialized. Internal: ${this.endpoint}:${this.port}, Public: ${this.publicUrl}`);
    }

    /**
     * Upload a file to MinIO storage
     * 
     * @param bucket - The bucket name (e.g., 'bantal-documents', 'bantal-assets', 'bantal-uploads')
     * @param path - The path within the bucket (e.g., 'invoices/2024/', 'images/')
     * @param fileName - The name of the file to store
     * @param file - The file buffer or stream to upload
     * @param options - Optional upload configuration
     * @returns Upload result with file URL and metadata
     * 
     * @example
     * ```typescript
     * const result = await minioService.uploadFile(
     *   'bantal-documents',
     *   'invoices/2024/',
     *   'invoice-001.pdf',
     *   fileBuffer,
     *   { contentType: 'application/pdf' }
     * );
     * console.log(result.url); // Full URL to access the file
     * ```
     */
    async uploadFile(
        bucket: string,
        path: string,
        fileName: string,
        file: Buffer | Readable | string,
        options?: MinioUploadOptions,
    ): Promise<MinioUploadResult> {
        try {
            // Ensure bucket exists
            await this.ensureBucketExists(bucket);

            // Normalize path (remove leading/trailing slashes, ensure trailing slash)
            const normalizedPath = this.normalizePath(path);

            // Construct full object path
            const objectPath = `${normalizedPath}${fileName}`;

            // Determine content type
            const contentType = options?.contentType || this.getContentType(fileName);

            // Prepare metadata
            const metadata = {
                'Content-Type': contentType,
                ...options?.metadata,
            };

            // Get file size
            let fileSize: number;
            if (Buffer.isBuffer(file)) {
                fileSize = file.length;
            } else {
                // For streams, we'll let MinIO handle it
                fileSize = 0;
            }

            this.logger.debug(`Uploading file to MinIO: ${bucket}/${objectPath}`);

            // Upload to MinIO
            const uploadResult = await this.minioClient.putObject(
                bucket,
                objectPath,
                file,
                fileSize || undefined,
                metadata,
            );

            this.logger.log(`File uploaded successfully: ${bucket}/${objectPath}`);

            // If public access is requested, set bucket policy
            if (options?.isPublic) {
                await this.makeObjectPublic(bucket, objectPath);
            }

            // Construct result
            const result: MinioUploadResult = {
                url: `${this.publicUrl}/${bucket}/${objectPath}`,
                bucket,
                objectPath,
                fileName,
                fileSize,
                contentType,
                etag: uploadResult.etag,
                uploadedAt: new Date(),
            };

            return result;
        } catch (error) {
            this.logger.error(`Failed to upload file to MinIO: ${error.message}`, error.stack);
            throw new InternalServerErrorException(`Failed to upload file: ${error.message}`);
        }
    }

    /**
     * Upload a file from Express Multer
     * 
     * @param bucket - The bucket name
     * @param path - The path within the bucket
     * @param file - The Multer file object
     * @param options - Optional upload configuration
     * @returns Upload result with file URL and metadata
     * 
     * @example
     * ```typescript
     * // In a controller with @UploadedFile() file: Express.Multer.File
     * const result = await minioService.uploadMulterFile(
     *   'bantal-uploads',
     *   'temp/',
     *   file
     * );
     * ```
     */
    async uploadMulterFile(
        bucket: string,
        path: string,
        file: Express.Multer.File,
        options?: MinioUploadOptions,
    ): Promise<MinioUploadResult> {
        const uploadOptions: MinioUploadOptions = {
            ...options,
            contentType: options?.contentType || file.mimetype,
        };

        return this.uploadFile(
            bucket,
            path,
            file.originalname,
            file.buffer,
            uploadOptions,
        );
    }

    /**
     * Delete a file from MinIO storage
     * 
     * @param bucket - The bucket name
     * @param objectPath - The full object path within the bucket
     */
    async deleteFile(bucket: string, objectPath: string): Promise<void> {
        try {
            this.logger.debug(`Deleting file from MinIO: ${bucket}/${objectPath}`);
            await this.minioClient.removeObject(bucket, objectPath);
            this.logger.log(`File deleted successfully: ${bucket}/${objectPath}`);
        } catch (error) {
            this.logger.error(`Failed to delete file from MinIO: ${error.message}`, error.stack);
            throw new InternalServerErrorException(`Failed to delete file: ${error.message}`);
        }
    }

    /**
     * Get a presigned URL for temporary access to a file
     * 
     * @param bucket - The bucket name
     * @param objectPath - The object path within the bucket
     * @param expirySeconds - URL expiry time in seconds (default: 3600 = 1 hour)
     * @returns Presigned URL
     */
    async getPresignedUrl(
        bucket: string,
        objectPath: string,
        expirySeconds: number = 3600,
    ): Promise<string> {
        try {
            // Use the presign client which is configured with public endpoint
            const url = await this.minioPresignClient.presignedGetObject(bucket, objectPath, expirySeconds);
            
            this.logger.debug(`Generated presigned URL: ${url.substring(0, 150)}...`);
            return url;
        } catch (error) {
            this.logger.error(`Failed to generate presigned URL: ${error.message}`, error.stack);
            throw new InternalServerErrorException(`Failed to generate presigned URL: ${error.message}`);
        }
    }

    /**
     * Get a file stream from MinIO
     * 
     * @param bucket - The bucket name
     * @param objectPath - The object path within the bucket
     * @returns Object with stream, content type, and file size
     */
    async getObjectStream(
        bucket: string,
        objectPath: string,
    ): Promise<{
        stream: Readable;
        contentType: string;
        contentLength?: number;
        etag?: string;
    }> {
        try {
            // Get object metadata first
            const stat = await this.minioClient.statObject(bucket, objectPath);
            
            // Get object stream
            const stream = await this.minioClient.getObject(bucket, objectPath);
            
            // Determine content type from file extension or metadata
            const contentType = this.getContentType(objectPath) || 
                               stat.metaData?.['content-type'] || 
                               'application/octet-stream';
            
            this.logger.debug(`Streaming file from MinIO: ${bucket}/${objectPath} (${contentType}, ${stat.size} bytes)`);
            
            return {
                stream,
                contentType,
                contentLength: stat.size,
                etag: stat.etag,
            };
        } catch (error) {
            this.logger.error(`Failed to get object stream from MinIO: ${error.message}`, error.stack);
            throw new InternalServerErrorException(`Failed to get file: ${error.message}`);
        }
    }

    /**
     * Check if a file exists in MinIO
     * 
     * @param bucket - The bucket name
     * @param objectPath - The object path within the bucket
     * @returns True if file exists, false otherwise
     */
    async fileExists(bucket: string, objectPath: string): Promise<boolean> {
        try {
            await this.minioClient.statObject(bucket, objectPath);
            return true;
        } catch (error) {
            if (error.code === 'NotFound') {
                return false;
            }
            throw error;
        }
    }

    /**
     * Get file metadata
     * 
     * @param bucket - The bucket name
     * @param objectPath - The object path within the bucket
     * @returns File metadata
     */
    async getFileMetadata(bucket: string, objectPath: string): Promise<Minio.BucketItemStat> {
        try {
            return await this.minioClient.statObject(bucket, objectPath);
        } catch (error) {
            this.logger.error(`Failed to get file metadata: ${error.message}`, error.stack);
            throw new InternalServerErrorException(`Failed to get file metadata: ${error.message}`);
        }
    }

    /**
     * List files in a bucket with optional prefix
     * 
     * @param bucket - The bucket name
     * @param prefix - Optional prefix to filter files
     * @param recursive - Whether to list recursively (default: true)
     * @returns Array of file objects
     */
    async listFiles(
        bucket: string,
        prefix?: string,
        recursive: boolean = true,
    ): Promise<Minio.BucketItem[]> {
        return new Promise((resolve, reject) => {
            const files: Minio.BucketItem[] = [];
            const stream = this.minioClient.listObjects(bucket, prefix, recursive);

            stream.on('data', (obj: Minio.BucketItem) => files.push(obj));
            stream.on('error', (err) => reject(err));
            stream.on('end', () => resolve(files));
        });
    }

    /**
     * Ensure a bucket exists, create it if it doesn't
     * 
     * @param bucket - The bucket name
     */
    private async ensureBucketExists(bucket: string): Promise<void> {
        try {
            const exists = await this.minioClient.bucketExists(bucket);
            if (!exists) {
                this.logger.warn(`Bucket ${bucket} does not exist, creating it...`);
                await this.minioClient.makeBucket(bucket);
                this.logger.log(`Bucket ${bucket} created successfully`);
            }
        } catch (error) {
            this.logger.error(`Failed to ensure bucket exists: ${error.message}`, error.stack);
            throw new InternalServerErrorException(`Failed to ensure bucket exists: ${error.message}`);
        }
    }

    /**
     * Make an object publicly accessible
     * 
     * @param bucket - The bucket name
     * @param objectPath - The object path
     */
    private async makeObjectPublic(bucket: string, objectPath: string): Promise<void> {
        try {
            // Note: This sets a bucket policy for the specific object
            // In production, you might want to set bucket-wide policies instead
            const policy = {
                Version: '2012-10-17',
                Statement: [
                    {
                        Effect: 'Allow',
                        Principal: { AWS: ['*'] },
                        Action: ['s3:GetObject'],
                        Resource: [`arn:aws:s3:::${bucket}/${objectPath}`],
                    },
                ],
            };

            await this.minioClient.setBucketPolicy(bucket, JSON.stringify(policy));
        } catch (error) {
            this.logger.warn(`Failed to make object public: ${error.message}`);
            // Don't throw error, just log warning
        }
    }

    /**
     * Normalize path by removing leading/trailing slashes and ensuring trailing slash
     * 
     * @param path - The path to normalize
     * @returns Normalized path
     */
    private normalizePath(path: string): string {
        if (!path) return '';

        // Remove leading and trailing slashes
        let normalized = path.replace(/^\/+|\/+$/g, '');

        // Add trailing slash if not empty
        if (normalized && !normalized.endsWith('/')) {
            normalized += '/';
        }

        return normalized;
    }

    /**
     * Get content type based on file extension
     * 
     * @param fileName - The file name
     * @returns Content type
     */
    private getContentType(fileName: string): string {
        const ext = fileName.split('.').pop()?.toLowerCase();

        const contentTypes: Record<string, string> = {
            // Documents
            pdf: 'application/pdf',
            doc: 'application/msword',
            docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            xls: 'application/vnd.ms-excel',
            xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ppt: 'application/vnd.ms-powerpoint',
            pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            txt: 'text/plain',

            // Images
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            gif: 'image/gif',
            webp: 'image/webp',
            svg: 'image/svg+xml',

            // Archives
            zip: 'application/zip',
            rar: 'application/x-rar-compressed',
            '7z': 'application/x-7z-compressed',

            // Other
            json: 'application/json',
            xml: 'application/xml',
            csv: 'text/csv',
        };

        return contentTypes[ext || ''] || 'application/octet-stream';
    }

    /**
     * Generate presigned URLs for multiple files at once
     * 
     * @param files - Array of file objects with bucket and objectPath
     * @param expirySeconds - URL expiry time in seconds (default: 3600 = 1 hour)
     * @returns Array of presigned URLs with metadata
     * 
     * @example
     * ```typescript
     * const urls = await minioService.getPresignedUrls([
     *   { bucket: 'bantal-assets', objectPath: 'images/2026/asset1.jpg' },
     *   { bucket: 'bantal-assets', objectPath: 'documents/invoice1.pdf' },
     * ], 3600);
     * ```
     */
    async getPresignedUrls(
        files: Array<{ bucket: string; objectPath: string }>,
        expirySeconds: number = 3600,
    ): Promise<Array<{ path: string; url: string; expiresAt: Date }>> {
        try {
            const results = await Promise.all(
                files.map(async ({ bucket, objectPath }) => {
                    const url = await this.getPresignedUrl(bucket, objectPath, expirySeconds);
                    return {
                        path: objectPath,
                        url,
                        expiresAt: new Date(Date.now() + expirySeconds * 1000),
                    };
                })
            );
            return results;
        } catch (error) {
            this.logger.error(`Failed to generate presigned URLs: ${error.message}`, error.stack);
            throw new InternalServerErrorException(`Failed to generate presigned URLs: ${error.message}`);
        }
    }
}
