# MinIO Service - Copy-Paste Usage Examples

Quick examples you can copy and paste directly into your code.

## 1. Basic File Upload in Controller

```typescript
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MinioService } from '@modules/minio';

@Controller('your-controller')
export class YourController {
  constructor(private readonly minioService: MinioService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const result = await this.minioService.uploadMulterFile(
      'bantal-documents',
      'your-path/',
      file,
    );

    return {
      success: true,
      url: result.url,
      fileName: result.fileName,
    };
  }
}
```

## 2. Upload in Service

```typescript
import { Injectable } from '@nestjs/common';
import { MinioService } from '@modules/minio';

@Injectable()
export class YourService {
  constructor(private readonly minioService: MinioService) {}

  async saveDocument(file: Express.Multer.File, userId: string) {
    const result = await this.minioService.uploadMulterFile(
      'bantal-documents',
      `users/${userId}/documents/`,
      file,
      {
        metadata: {
          'user-id': userId,
          'upload-date': new Date().toISOString(),
        },
      },
    );

    // Save result.url to your database
    return result.url;
  }
}
```

## 3. Upload Invoice with Date-Based Path

```typescript
async uploadInvoice(file: Express.Multer.File, invoiceNumber: string) {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');

  const result = await this.minioService.uploadMulterFile(
    'bantal-documents',
    `invoices/${year}/${month}/`,
    file,
    {
      metadata: {
        'invoice-number': invoiceNumber,
        'upload-timestamp': new Date().toISOString(),
      }
    }
  );

  return result;
}
```

## 4. Upload Image Asset

```typescript
async uploadLogo(file: Express.Multer.File, companyId: string) {
  const result = await this.minioService.uploadMulterFile(
    'bantal-assets',
    `logos/${companyId}/`,
    file,
    {
      contentType: 'image/png',
      isPublic: true, // Make publicly accessible
      metadata: {
        'company-id': companyId,
      }
    }
  );

  return result.url;
}
```

## 5. Upload from Buffer

```typescript
async uploadGeneratedPDF(pdfBuffer: Buffer, fileName: string) {
  const result = await this.minioService.uploadFile(
    'bantal-documents',
    'generated/',
    fileName,
    pdfBuffer,
    {
      contentType: 'application/pdf',
      metadata: {
        'generated': 'true',
        'timestamp': new Date().toISOString(),
      }
    }
  );

  return result.url;
}
```

## 6. Generate Download Link

```typescript
async getDownloadLink(filePath: string) {
  // Generate a URL that expires in 1 hour
  const downloadUrl = await this.minioService.getPresignedUrl(
    'bantal-documents',
    filePath,
    3600 // 1 hour in seconds
  );

  return { downloadUrl, expiresIn: '1 hour' };
}
```

## 7. Delete Old File Before Upload

```typescript
async replaceDocument(
  oldFilePath: string,
  newFile: Express.Multer.File
) {
  // Delete old file if exists
  const exists = await this.minioService.fileExists(
    'bantal-documents',
    oldFilePath
  );

  if (exists) {
    await this.minioService.deleteFile('bantal-documents', oldFilePath);
  }

  // Upload new file
  const result = await this.minioService.uploadMulterFile(
    'bantal-documents',
    'documents/',
    newFile
  );

  return result.url;
}
```

## 8. Upload Multiple Files

```typescript
@Post('upload-multiple')
@UseInterceptors(FilesInterceptor('files', 10))
async uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
  const uploadPromises = files.map(file =>
    this.minioService.uploadMulterFile(
      'bantal-documents',
      'batch/',
      file
    )
  );

  const results = await Promise.all(uploadPromises);

  return {
    success: true,
    count: results.length,
    files: results.map(r => ({
      url: r.url,
      fileName: r.fileName,
    })),
  };
}
```

## 9. Check File Before Operation

```typescript
async processDocument(filePath: string) {
  const exists = await this.minioService.fileExists(
    'bantal-documents',
    filePath
  );

  if (!exists) {
    throw new NotFoundException('Document not found');
  }

  // Get file metadata
  const metadata = await this.minioService.getFileMetadata(
    'bantal-documents',
    filePath
  );

  return {
    exists: true,
    size: metadata.size,
    lastModified: metadata.lastModified,
  };
}
```

## 10. List User Documents

```typescript
async getUserDocuments(userId: string) {
  const files = await this.minioService.listFiles(
    'bantal-documents',
    `users/${userId}/`,
    true // recursive
  );

  return files.map(file => ({
    name: file.name,
    size: file.size,
    lastModified: file.lastModified,
  }));
}
```

## 11. Upload with File Validation

```typescript
@Post('upload-validated')
@UseInterceptors(FileInterceptor('file', {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, callback) => {
    // Only allow PDFs
    if (file.mimetype !== 'application/pdf') {
      return callback(
        new BadRequestException('Only PDF files are allowed'),
        false
      );
    }
    callback(null, true);
  },
}))
async uploadPDF(@UploadedFile() file: Express.Multer.File) {
  const result = await this.minioService.uploadMulterFile(
    'bantal-documents',
    'pdfs/',
    file
  );

  return result;
}
```

## 12. Upload Contract with Metadata

```typescript
async uploadContract(
  file: Express.Multer.File,
  contractData: {
    contractNumber: string;
    clientId: string;
    signedDate: Date;
  }
) {
  const result = await this.minioService.uploadMulterFile(
    'bantal-documents',
    `contracts/${contractData.clientId}/`,
    file,
    {
      metadata: {
        'contract-number': contractData.contractNumber,
        'client-id': contractData.clientId,
        'signed-date': contractData.signedDate.toISOString(),
        'upload-timestamp': new Date().toISOString(),
      }
    }
  );

  // Save to database
  await this.contractRepository.save({
    contractNumber: contractData.contractNumber,
    clientId: contractData.clientId,
    signedDate: contractData.signedDate,
    fileUrl: result.url,
    fileName: result.fileName,
    fileSize: result.fileSize,
  });

  return result;
}
```

## 13. Temporary Upload with Cleanup

```typescript
async uploadTemporary(file: Express.Multer.File) {
  // Upload to temp location
  const result = await this.minioService.uploadMulterFile(
    'bantal-uploads',
    'temp/',
    file
  );

  // Schedule cleanup after 24 hours
  setTimeout(async () => {
    await this.minioService.deleteFile(
      'bantal-uploads',
      result.objectPath
    );
  }, 24 * 60 * 60 * 1000); // 24 hours

  return result.url;
}
```

## 14. Upload with Custom Filename

```typescript
async uploadWithCustomName(
  file: Express.Multer.File,
  customName: string
) {
  // Extract extension from original file
  const ext = file.originalname.split('.').pop();
  const fileName = `${customName}.${ext}`;

  const result = await this.minioService.uploadFile(
    'bantal-documents',
    'custom/',
    fileName,
    file.buffer,
    {
      contentType: file.mimetype,
    }
  );

  return result;
}
```

## 15. Complete Upload Flow with Error Handling

```typescript
async completeUploadFlow(file: Express.Multer.File, userId: string) {
  try {
    // Validate file
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Check file size
    if (file.size > 20 * 1024 * 1024) {
      throw new BadRequestException('File too large (max 20MB)');
    }

    // Upload to MinIO
    const result = await this.minioService.uploadMulterFile(
      'bantal-documents',
      `users/${userId}/`,
      file,
      {
        metadata: {
          'user-id': userId,
          'original-name': file.originalname,
          'upload-timestamp': new Date().toISOString(),
        }
      }
    );

    // Save to database
    const document = await this.documentRepository.save({
      userId,
      fileName: result.fileName,
      fileUrl: result.url,
      fileSize: result.fileSize,
      contentType: result.contentType,
      uploadedAt: result.uploadedAt,
    });

    // Return success response
    return {
      success: true,
      message: 'File uploaded successfully',
      data: {
        id: document.id,
        url: result.url,
        fileName: result.fileName,
        fileSize: result.fileSize,
      },
    };

  } catch (error) {
    // Log error
    this.logger.error(`Upload failed: ${error.message}`, error.stack);

    // Return user-friendly error
    throw new InternalServerErrorException(
      'Failed to upload file. Please try again.'
    );
  }
}
```

## Quick Reference

### Buckets

- `bantal-documents` - Documents
- `bantal-assets` - Assets
- `bantal-uploads` - Temporary uploads

### Common Paths

- `invoices/YYYY/MM/`
- `contracts/client-id/`
- `users/user-id/documents/`
- `assets/images/`
- `temp/`

### File Size Limits

Set in `@UseInterceptors(FileInterceptor('file', { limits: { fileSize: ... } }))`:

- Documents: 20MB
- Images: 10MB
- Archives: 50MB

### Presigned URL Expiry

- Short: 300 seconds (5 minutes)
- Medium: 3600 seconds (1 hour)
- Long: 86400 seconds (24 hours)

---

**Tip:** Replace `'your-path/'`, `'your-controller'`, and other placeholders with your actual values!
