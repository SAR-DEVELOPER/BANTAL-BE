# MinIO Service Module

A global, reusable MinIO service for handling file uploads and storage operations across the BANTAL backend application.

## Features

- ✅ **Global Service**: Available in all modules without explicit imports
- ✅ **Type-Safe**: Full TypeScript support with comprehensive interfaces
- ✅ **Flexible Upload**: Support for Buffer, Stream, and Multer files
- ✅ **Automatic Bucket Management**: Creates buckets if they don't exist
- ✅ **Path Normalization**: Handles path formatting automatically
- ✅ **Content Type Detection**: Automatic MIME type detection based on file extension
- ✅ **Presigned URLs**: Generate temporary access URLs
- ✅ **File Management**: Delete, list, and check file existence
- ✅ **Metadata Support**: Attach custom metadata to files
- ✅ **Public Access**: Optional public file access configuration

## Installation

The MinIO service is already installed and configured globally. No additional setup is required.

## Configuration

The service uses the following environment variables (already configured in `docker-compose.yaml`):

```env
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=${MINIO_BACKEND_USER}
MINIO_SECRET_KEY=${MINIO_BACKEND_PASSWORD}
```

## Available Buckets

The following buckets are pre-configured:
- `bantal-assets` - For application assets (images, logos, etc.)
- `bantal-documents` - For document storage (PDFs, Word docs, etc.)
- `bantal-uploads` - For temporary or user uploads

## Usage

### Basic Usage in Controllers

```typescript
import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MinioService } from '@modules/minio';

@Controller('upload')
export class UploadController {
  constructor(private readonly minioService: MinioService) {}

  @Post('document')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(@UploadedFile() file: Express.Multer.File) {
    const result = await this.minioService.uploadMulterFile(
      'bantal-documents',
      'invoices/2024/',
      file
    );

    return {
      message: 'File uploaded successfully',
      url: result.url,
      fileName: result.fileName,
      fileSize: result.fileSize,
    };
  }
}
```

### Usage in Services

```typescript
import { Injectable } from '@nestjs/common';
import { MinioService } from '@modules/minio';

@Injectable()
export class DocumentService {
  constructor(private readonly minioService: MinioService) {}

  async saveInvoice(file: Express.Multer.File, invoiceId: string) {
    // Upload file to MinIO
    const result = await this.minioService.uploadMulterFile(
      'bantal-documents',
      `invoices/${new Date().getFullYear()}/`,
      file,
      {
        metadata: {
          'invoice-id': invoiceId,
          'uploaded-by': 'system',
        }
      }
    );

    // Save the URL to your database
    return result.url;
  }

  async saveAsset(imageBuffer: Buffer, fileName: string) {
    // Upload buffer directly
    const result = await this.minioService.uploadFile(
      'bantal-assets',
      'images/',
      fileName,
      imageBuffer,
      {
        contentType: 'image/jpeg',
        isPublic: true, // Make publicly accessible
      }
    );

    return result.url;
  }
}
```

### Upload with Custom Options

```typescript
const result = await this.minioService.uploadFile(
  'bantal-uploads',
  'temp/user-123/',
  'document.pdf',
  fileBuffer,
  {
    contentType: 'application/pdf',
    metadata: {
      'user-id': '123',
      'upload-date': new Date().toISOString(),
      'document-type': 'invoice',
    },
    isPublic: false, // Private file (default)
  }
);
```

### Generate Presigned URL for Temporary Access

```typescript
// Generate a URL that expires in 1 hour (3600 seconds)
const temporaryUrl = await this.minioService.getPresignedUrl(
  'bantal-documents',
  'invoices/2024/invoice-001.pdf',
  3600
);

// Send this URL to the client for download
return { downloadUrl: temporaryUrl };
```

### Delete a File

```typescript
await this.minioService.deleteFile(
  'bantal-uploads',
  'temp/user-123/document.pdf'
);
```

### Check if File Exists

```typescript
const exists = await this.minioService.fileExists(
  'bantal-documents',
  'invoices/2024/invoice-001.pdf'
);

if (!exists) {
  throw new NotFoundException('File not found');
}
```

### List Files in a Bucket

```typescript
// List all files in a specific path
const files = await this.minioService.listFiles(
  'bantal-documents',
  'invoices/2024/', // prefix
  true // recursive
);

files.forEach(file => {
  console.log(`File: ${file.name}, Size: ${file.size} bytes`);
});
```

### Get File Metadata

```typescript
const metadata = await this.minioService.getFileMetadata(
  'bantal-documents',
  'invoices/2024/invoice-001.pdf'
);

console.log('File size:', metadata.size);
console.log('Last modified:', metadata.lastModified);
console.log('Content type:', metadata.metaData['content-type']);
```

## API Reference

### `uploadFile(bucket, path, fileName, file, options?)`

Upload a file to MinIO storage.

**Parameters:**
- `bucket` (string): Bucket name (e.g., 'bantal-documents')
- `path` (string): Path within bucket (e.g., 'invoices/2024/')
- `fileName` (string): Name of the file to store
- `file` (Buffer | Stream): File content
- `options` (MinioUploadOptions): Optional configuration

**Returns:** `Promise<MinioUploadResult>`

### `uploadMulterFile(bucket, path, file, options?)`

Upload a Multer file object.

**Parameters:**
- `bucket` (string): Bucket name
- `path` (string): Path within bucket
- `file` (Express.Multer.File): Multer file object
- `options` (MinioUploadOptions): Optional configuration

**Returns:** `Promise<MinioUploadResult>`

### `deleteFile(bucket, objectPath)`

Delete a file from storage.

**Parameters:**
- `bucket` (string): Bucket name
- `objectPath` (string): Full object path

**Returns:** `Promise<void>`

### `getPresignedUrl(bucket, objectPath, expirySeconds?)`

Generate a temporary access URL.

**Parameters:**
- `bucket` (string): Bucket name
- `objectPath` (string): Object path
- `expirySeconds` (number): URL expiry time (default: 3600)

**Returns:** `Promise<string>`

### `fileExists(bucket, objectPath)`

Check if a file exists.

**Parameters:**
- `bucket` (string): Bucket name
- `objectPath` (string): Object path

**Returns:** `Promise<boolean>`

### `getFileMetadata(bucket, objectPath)`

Get file metadata.

**Parameters:**
- `bucket` (string): Bucket name
- `objectPath` (string): Object path

**Returns:** `Promise<Minio.BucketItemStat>`

### `listFiles(bucket, prefix?, recursive?)`

List files in a bucket.

**Parameters:**
- `bucket` (string): Bucket name
- `prefix` (string): Optional prefix filter
- `recursive` (boolean): List recursively (default: true)

**Returns:** `Promise<Minio.BucketItem[]>`

## Types

### MinioUploadResult

```typescript
interface MinioUploadResult {
  url: string;           // Full URL to access the file
  bucket: string;        // Bucket name
  objectPath: string;    // Object path within bucket
  fileName: string;      // Original filename
  fileSize: number;      // File size in bytes
  contentType: string;   // MIME type
  etag: string;          // ETag from MinIO
  uploadedAt: Date;      // Upload timestamp
}
```

### MinioUploadOptions

```typescript
interface MinioUploadOptions {
  metadata?: Record<string, string>;  // Custom metadata
  contentType?: string;                // Content type override
  isPublic?: boolean;                  // Public access (default: false)
}
```

## Path Handling

The service automatically normalizes paths:
- Removes leading/trailing slashes
- Ensures trailing slash for directories
- Handles empty paths gracefully

**Examples:**
```typescript
'/invoices/2024/'  → 'invoices/2024/'
'invoices/2024'    → 'invoices/2024/'
'invoices//2024/'  → 'invoices/2024/'
''                 → ''
```

## Content Type Detection

The service automatically detects content types based on file extensions:

| Extension | Content Type |
|-----------|-------------|
| pdf | application/pdf |
| doc | application/msword |
| docx | application/vnd.openxmlformats-officedocument.wordprocessingml.document |
| jpg, jpeg | image/jpeg |
| png | image/png |
| gif | image/gif |
| webp | image/webp |
| zip | application/zip |
| json | application/json |
| csv | text/csv |

You can override the detected content type using the `contentType` option.

## Error Handling

All methods throw `InternalServerErrorException` on failure with descriptive error messages:

```typescript
try {
  const result = await this.minioService.uploadFile(...);
} catch (error) {
  // Error is already logged by the service
  // Handle the error appropriately
  throw new BadRequestException('Failed to upload file');
}
```

## Best Practices

1. **Use Descriptive Paths**: Organize files with clear directory structures
   ```typescript
   'documents/invoices/2024/01/'
   'assets/images/products/'
   'uploads/temp/user-123/'
   ```

2. **Add Metadata**: Include relevant metadata for tracking
   ```typescript
   {
     metadata: {
       'user-id': userId,
       'document-type': 'invoice',
       'created-at': new Date().toISOString(),
     }
   }
   ```

3. **Use Presigned URLs**: For secure, temporary access to private files
   ```typescript
   const url = await minioService.getPresignedUrl(bucket, path, 3600);
   ```

4. **Clean Up Temp Files**: Delete temporary uploads when no longer needed
   ```typescript
   await minioService.deleteFile('bantal-uploads', tempFilePath);
   ```

5. **Check File Existence**: Before operations that depend on file presence
   ```typescript
   if (await minioService.fileExists(bucket, path)) {
     // File exists, proceed
   }
   ```

## Migration from MongoDB

If you're currently using MongoDB for file storage, you can migrate to MinIO:

```typescript
// Old MongoDB approach
const mongoDocId = await this.documentService.uploadToMongoDB(
  file.buffer,
  file.mimetype
);

// New MinIO approach
const result = await this.minioService.uploadMulterFile(
  'bantal-documents',
  'documents/',
  file
);
// Store result.url in your database instead of mongoDocId
```

## Troubleshooting

### Connection Issues

If you see connection errors, verify:
1. MinIO service is running: `docker ps | grep minio`
2. Environment variables are set correctly
3. Network connectivity between backend and MinIO

### Bucket Not Found

The service automatically creates buckets if they don't exist. If you see bucket errors:
1. Check MinIO console at http://localhost:9101
2. Verify bucket permissions
3. Check MinIO initialization logs

### Upload Failures

Common causes:
1. File size exceeds limits
2. Invalid file format
3. Insufficient permissions
4. Network issues

Check the logs for detailed error messages.

## Support

For issues or questions, contact the backend development team.
