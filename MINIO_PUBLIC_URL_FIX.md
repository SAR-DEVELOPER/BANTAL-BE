# MinIO Public URL Configuration Fix

## Problem

Asset images were returning 404 errors in the frontend because the MinIO service was using the internal Docker hostname (`minio:9000`) to construct file URLs. This hostname is not accessible from browsers outside the Docker network.

### Error Example
```
Failed to load resource: net::ERR_NAME_NOT_RESOLVED
http://minio:9000/bantal-assets/assets/2026/SAR-26-INV-001-001/image.png
```

## Root Cause

The MinIO service was constructing the public URL using the `MINIO_ENDPOINT` environment variable, which was set to `minio` (the Docker service name). This works for internal container-to-container communication but not for external browser access.

## Solution

Added a separate `MINIO_PUBLIC_URL` environment variable that allows specifying a different URL for public/browser access while maintaining the internal Docker hostname for backend operations.

### Changes Made

#### 1. Updated MinIO Service (`BANTAL-BE/src/modules/minio/minio.service.ts`)

```typescript
// Use MINIO_PUBLIC_URL if provided, otherwise construct from endpoint
// This allows different URLs for internal (Docker) and external (browser) access
this.publicUrl = this.configService.get<string>('MINIO_PUBLIC_URL');
if (!this.publicUrl) {
    const protocol = this.useSSL ? 'https' : 'http';
    this.publicUrl = `${protocol}://${this.endpoint}:${this.port}`;
}

this.logger.log(`MinIO client initialized. Internal: ${this.endpoint}:${this.port}, Public: ${this.publicUrl}`);
```

#### 2. Updated Docker Compose (`BANTAL-BE/docker-compose.yaml`)

Added the new environment variable:

```yaml
# MinIO Configuration
- MINIO_ENDPOINT=minio
- MINIO_PORT=9000
- MINIO_USE_SSL=false
- MINIO_ACCESS_KEY=${MINIO_BACKEND_USER}
- MINIO_SECRET_KEY=${MINIO_BACKEND_PASSWORD}
# MinIO Public URL (for browser access - uses host's external URL)
- MINIO_PUBLIC_URL=https://minio.centri.id
```

## How It Works

1. **Internal Communication**: Backend uses `MINIO_ENDPOINT=minio` and `MINIO_PORT=9000` to connect to MinIO within the Docker network
2. **Public URLs**: When uploading files, the service returns URLs using `MINIO_PUBLIC_URL` (e.g., `https://minio.centri.id/bantal-assets/...`)
3. **Browser Access**: Browsers can now access the images using the public URL

## Configuration

### Production Environment

Set `MINIO_PUBLIC_URL` to your publicly accessible MinIO endpoint:

```bash
MINIO_PUBLIC_URL=https://minio.centri.id
```

### Development Environment (Local)

For local development, use:

```bash
MINIO_PUBLIC_URL=http://localhost:9100
```

Note: Port 9100 is mapped to MinIO's internal port 9000 in docker-compose.

### Without MINIO_PUBLIC_URL

If `MINIO_PUBLIC_URL` is not set, the service falls back to constructing the URL from `MINIO_ENDPOINT` and `MINIO_PORT`, maintaining backward compatibility.

## Verification

After applying this fix:

1. Restart the backend service:
   ```bash
   docker-compose restart backend
   ```

2. Upload a new asset with an image

3. Check the asset details page - the image should now load correctly

4. Verify the URL in the database - it should use the public URL:
   ```sql
   SELECT photo_url FROM asset LIMIT 1;
   -- Should return: https://minio.centri.id/bantal-assets/...
   ```

## MinIO Proxy/CDN Setup

For production, ensure your reverse proxy (Nginx/Caddy) or CDN is configured to forward requests to MinIO:

### Nginx Example

```nginx
server {
    listen 443 ssl;
    server_name minio.centri.id;

    # SSL configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Proxy to MinIO
    location / {
        proxy_pass http://localhost:9100;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # MinIO specific headers
        proxy_buffering off;
        proxy_request_buffering off;
    }
}
```

## Benefits

1. ✅ **Separation of Concerns**: Internal and external URLs are managed separately
2. ✅ **Flexibility**: Easy to change public URL without affecting internal communication
3. ✅ **CDN Support**: Can easily point to a CDN URL
4. ✅ **Backward Compatible**: Falls back to old behavior if not set
5. ✅ **Environment Specific**: Different URLs for dev/staging/production

## Related Files

- `BANTAL-BE/src/modules/minio/minio.service.ts` - MinIO service implementation
- `BANTAL-BE/docker-compose.yaml` - Docker configuration
- `BANTAL-BE/src/modules/assets/assets.service.ts` - Uses MinIO for asset uploads
- `GA/src/app/assets/[id]/page.tsx` - Displays asset images
