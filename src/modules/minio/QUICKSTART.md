# MinIO Service - Quick Start Guide

Get started with the MinIO file upload service in 5 minutes!

## 🚀 Quick Example

```typescript
import { Injectable } from '@nestjs/common';
import { MinioService } from '@modules/minio';

@Injectable()
export class YourService {
  constructor(private readonly minioService: MinioService) {}

  async uploadFile(file: Express.Multer.File) {
    // Upload to MinIO
    const result = await this.minioService.uploadMulterFile(
      'bantal-documents',  // bucket name
      'invoices/',         // path in bucket
      file                 // the file
    );

    // Use the URL
    console.log('File uploaded:', result.url);
    return result.url;
  }
}
```

That's it! The service is global, so you can inject it anywhere.

## 📦 Available Buckets

- `bantal-documents` - Documents (PDFs, Word, Excel, etc.)
- `bantal-assets` - Assets (images, logos, etc.)
- `bantal-uploads` - Temporary/user uploads

## 🎯 Common Use Cases

### 1. Upload from Controller

```typescript
@Controller('upload')
export class UploadController {
  constructor(private readonly minioService: MinioService) {}

  @Post('invoice')
  @UseInterceptors(FileInterceptor('file'))
  async uploadInvoice(@UploadedFile() file: Express.Multer.File) {
    const result = await this.minioService.uploadMulterFile(
      'bantal-documents',
      'invoices/2024/',
      file
    );
    
    return { url: result.url };
  }
}
```

### 2. Upload with Metadata

```typescript
const result = await this.minioService.uploadMulterFile(
  'bantal-documents',
  'contracts/',
  file,
  {
    metadata: {
      'user-id': '123',
      'document-type': 'contract',
    }
  }
);
```

### 3. Upload Buffer Directly

```typescript
const imageBuffer = await generateImage();

const result = await this.minioService.uploadFile(
  'bantal-assets',
  'generated/',
  'chart.png',
  imageBuffer,
  { contentType: 'image/png' }
);
```

### 4. Generate Temporary Download Link

```typescript
// Get a URL that expires in 1 hour
const downloadUrl = await this.minioService.getPresignedUrl(
  'bantal-documents',
  'invoices/2024/invoice-001.pdf',
  3600  // seconds
);

// Send to client
return { downloadUrl };
```

### 5. Delete File

```typescript
await this.minioService.deleteFile(
  'bantal-uploads',
  'temp/file.pdf'
);
```

### 6. Check if File Exists

```typescript
const exists = await this.minioService.fileExists(
  'bantal-documents',
  'invoices/2024/invoice-001.pdf'
);

if (!exists) {
  throw new NotFoundException('File not found');
}
```

## 🔧 Configuration

Already configured! Uses these environment variables:

```env
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=${MINIO_BACKEND_USER}
MINIO_SECRET_KEY=${MINIO_BACKEND_PASSWORD}
```

## 📝 Path Conventions

Use clear, organized paths:

```typescript
// ✅ Good
'invoices/2024/01/'
'contracts/clients/acme-corp/'
'assets/images/products/'

// ❌ Avoid
'files/'
'uploads/'
'temp123/'
```

## 🎨 Return Value

All upload methods return:

```typescript
{
  url: string;           // Full URL to access file
  bucket: string;        // Bucket name
  objectPath: string;    // Path in bucket
  fileName: string;      // Original filename
  fileSize: number;      // Size in bytes
  contentType: string;   // MIME type
  etag: string;          // MinIO ETag
  uploadedAt: Date;      // Upload timestamp
}
```

## 🔍 Need More?

- See [README.md](./README.md) for complete documentation
- See [minio.controller.example.ts](./minio.controller.example.ts) for more examples
- Check [minio.service.ts](./minio.service.ts) for all available methods

## 🐛 Troubleshooting

**Problem:** Connection refused
- **Solution:** Make sure MinIO is running: `docker ps | grep minio`

**Problem:** Access denied
- **Solution:** Check environment variables are set correctly

**Problem:** Bucket not found
- **Solution:** The service creates buckets automatically. Check MinIO console at http://localhost:9101

## 💡 Tips

1. **Always use descriptive paths** - Makes files easier to find
2. **Add metadata** - Helps with tracking and debugging
3. **Use presigned URLs** - For secure, temporary access
4. **Clean up temp files** - Delete files you don't need anymore
5. **Check existence first** - Before operations that depend on files

## 🎓 Next Steps

1. Try the quick example above
2. Add file upload to your controller
3. Store the returned URL in your database
4. Use presigned URLs for downloads

Happy coding! 🚀
