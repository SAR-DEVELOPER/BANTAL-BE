/**
 * MinIO Upload Controller Example
 * 
 * This is an example controller demonstrating how to use the MinIO service
 * for file uploads. You can use this as a reference or copy parts of it
 * to your own controllers.
 * 
 * To use this controller, uncomment it in minio.module.ts
 */

import {
    Controller,
    Post,
    UploadedFile,
    UploadedFiles,
    UseInterceptors,
    BadRequestException,
    Body,
    Get,
    Param,
    Delete,
    Query,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { MinioService } from './minio.service';

@Controller('minio')
export class MinioController {
    constructor(private readonly minioService: MinioService) { }

    /**
     * Upload a single document
     * POST /minio/upload/document
     * 
     * @example
     * curl -X POST http://localhost:4000/minio/upload/document \
     *   -F "file=@document.pdf" \
     *   -F "path=invoices/2024/"
     */
    @Post('upload/document')
    @UseInterceptors(FileInterceptor('file', {
        limits: {
            fileSize: 20 * 1024 * 1024, // 20MB max
        },
    }))
    async uploadDocument(
        @UploadedFile() file: Express.Multer.File,
        @Body('path') path?: string,
    ) {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        const result = await this.minioService.uploadMulterFile(
            'bantal-documents',
            path || 'general/',
            file,
            {
                metadata: {
                    'upload-source': 'api',
                    'upload-timestamp': new Date().toISOString(),
                },
            },
        );

        return {
            success: true,
            message: 'Document uploaded successfully',
            data: {
                url: result.url,
                fileName: result.fileName,
                fileSize: result.fileSize,
                contentType: result.contentType,
                uploadedAt: result.uploadedAt,
            },
        };
    }

    /**
     * Upload a single image/asset
     * POST /minio/upload/asset
     * 
     * @example
     * curl -X POST http://localhost:4000/minio/upload/asset \
     *   -F "file=@logo.png" \
     *   -F "path=images/" \
     *   -F "isPublic=true"
     */
    @Post('upload/asset')
    @UseInterceptors(FileInterceptor('file', {
        limits: {
            fileSize: 10 * 1024 * 1024, // 10MB max
        },
        fileFilter: (req, file, callback) => {
            // Only allow images
            if (!file.mimetype.startsWith('image/')) {
                return callback(new BadRequestException('Only image files are allowed'), false);
            }
            callback(null, true);
        },
    }))
    async uploadAsset(
        @UploadedFile() file: Express.Multer.File,
        @Body('path') path?: string,
        @Body('isPublic') isPublic?: string,
    ) {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        const result = await this.minioService.uploadMulterFile(
            'bantal-assets',
            path || 'images/',
            file,
            {
                isPublic: isPublic === 'true',
                metadata: {
                    'asset-type': 'image',
                    'upload-timestamp': new Date().toISOString(),
                },
            },
        );

        return {
            success: true,
            message: 'Asset uploaded successfully',
            data: {
                url: result.url,
                fileName: result.fileName,
                fileSize: result.fileSize,
                contentType: result.contentType,
            },
        };
    }

    /**
     * Upload multiple files
     * POST /minio/upload/multiple
     * 
     * @example
     * curl -X POST http://localhost:4000/minio/upload/multiple \
     *   -F "files=@file1.pdf" \
     *   -F "files=@file2.pdf" \
     *   -F "path=batch/"
     */
    @Post('upload/multiple')
    @UseInterceptors(FilesInterceptor('files', 10, {
        limits: {
            fileSize: 20 * 1024 * 1024, // 20MB per file
        },
    }))
    async uploadMultiple(
        @UploadedFiles() files: Express.Multer.File[],
        @Body('path') path?: string,
    ) {
        if (!files || files.length === 0) {
            throw new BadRequestException('No files provided');
        }

        const uploadPromises = files.map(file =>
            this.minioService.uploadMulterFile(
                'bantal-uploads',
                path || 'batch/',
                file,
            ),
        );

        const results = await Promise.all(uploadPromises);

        return {
            success: true,
            message: `${results.length} files uploaded successfully`,
            data: results.map(r => ({
                url: r.url,
                fileName: r.fileName,
                fileSize: r.fileSize,
            })),
        };
    }

    /**
     * Get a presigned URL for temporary access
     * GET /minio/presigned/:bucket/:path
     * 
     * @example
     * GET /minio/presigned/bantal-documents/invoices/2024/invoice-001.pdf?expiry=3600
     */
    @Get('presigned/:bucket/*')
    async getPresignedUrl(
        @Param('bucket') bucket: string,
        @Param() params: any,
        @Query('expiry') expiry?: string,
    ) {
        // Extract the full path after the bucket parameter
        const path = params[0];

        if (!path) {
            throw new BadRequestException('File path is required');
        }

        const expirySeconds = expiry ? parseInt(expiry, 10) : 3600;

        const url = await this.minioService.getPresignedUrl(
            bucket,
            path,
            expirySeconds,
        );

        return {
            success: true,
            data: {
                url,
                expiresIn: expirySeconds,
            },
        };
    }

    /**
     * Check if a file exists
     * GET /minio/exists/:bucket/:path
     * 
     * @example
     * GET /minio/exists/bantal-documents/invoices/2024/invoice-001.pdf
     */
    @Get('exists/:bucket/*')
    async checkFileExists(
        @Param('bucket') bucket: string,
        @Param() params: any,
    ) {
        const path = params[0];

        if (!path) {
            throw new BadRequestException('File path is required');
        }

        const exists = await this.minioService.fileExists(bucket, path);

        return {
            success: true,
            data: {
                exists,
                bucket,
                path,
            },
        };
    }

    /**
     * List files in a bucket
     * GET /minio/list/:bucket?prefix=path/to/folder
     * 
     * @example
     * GET /minio/list/bantal-documents?prefix=invoices/2024/
     */
    @Get('list/:bucket')
    async listFiles(
        @Param('bucket') bucket: string,
        @Query('prefix') prefix?: string,
        @Query('recursive') recursive?: string,
    ) {
        const files = await this.minioService.listFiles(
            bucket,
            prefix,
            recursive !== 'false',
        );

        return {
            success: true,
            data: {
                bucket,
                prefix: prefix || '/',
                count: files.length,
                files: files.map(f => ({
                    name: f.name,
                    size: f.size,
                    lastModified: f.lastModified,
                    etag: f.etag,
                })),
            },
        };
    }

    /**
     * Get file metadata
     * GET /minio/metadata/:bucket/:path
     * 
     * @example
     * GET /minio/metadata/bantal-documents/invoices/2024/invoice-001.pdf
     */
    @Get('metadata/:bucket/*')
    async getFileMetadata(
        @Param('bucket') bucket: string,
        @Param() params: any,
    ) {
        const path = params[0];

        if (!path) {
            throw new BadRequestException('File path is required');
        }

        const metadata = await this.minioService.getFileMetadata(bucket, path);

        return {
            success: true,
            data: {
                bucket,
                path,
                size: metadata.size,
                lastModified: metadata.lastModified,
                contentType: metadata.metaData['content-type'],
                etag: metadata.etag,
                metadata: metadata.metaData,
            },
        };
    }

    /**
     * Delete a file
     * DELETE /minio/:bucket/:path
     * 
     * @example
     * DELETE /minio/bantal-uploads/temp/file.pdf
     */
    @Delete(':bucket/*')
    async deleteFile(
        @Param('bucket') bucket: string,
        @Param() params: any,
    ) {
        const path = params[0];

        if (!path) {
            throw new BadRequestException('File path is required');
        }

        await this.minioService.deleteFile(bucket, path);

        return {
            success: true,
            message: 'File deleted successfully',
            data: {
                bucket,
                path,
            },
        };
    }
}
