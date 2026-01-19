import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MinioService } from './minio.service';

/**
 * MinIO Module
 * 
 * This module provides a global MinIO service for file uploads and management.
 * It's marked as @Global() so it can be used across all modules without importing.
 * 
 * @example
 * ```typescript
 * // In any service or controller
 * constructor(private readonly minioService: MinioService) {}
 * 
 * async uploadFile(file: Express.Multer.File) {
 *   const result = await this.minioService.uploadMulterFile(
 *     'bantal-uploads',
 *     'documents/',
 *     file
 *   );
 *   return result.url;
 * }
 * ```
 */
@Global()
@Module({
    imports: [ConfigModule],
    providers: [MinioService],
    exports: [MinioService],
})
export class MinioModule { }
