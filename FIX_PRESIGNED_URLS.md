# Fix Presigned URL Issues

## Problems Identified

1. **Existing assets have full URLs** in database instead of object paths
2. **MinIO public URL** is set to `https://minio.centri.id` which needs proper DNS/proxy setup

## Solution Steps

### Step 1: Fix Existing Asset Data in Database

Run this SQL to convert full URLs to object paths:

```bash
# Connect to PostgreSQL container
docker exec -it postgres-db psql -U postgres -d bantal_db

# Then run this SQL:
```

```sql
-- Update photo_url: Extract path after 'bantal-assets/'
UPDATE asset 
SET photo_url = REGEXP_REPLACE(photo_url, '^.*bantal-assets/', '', 'g')
WHERE photo_url IS NOT NULL 
  AND photo_url LIKE '%bantal-assets/%';

-- Update invoice_file: Extract path after 'bantal-assets/'
UPDATE asset 
SET invoice_file = REGEXP_REPLACE(invoice_file, '^.*bantal-assets/', '', 'g')
WHERE invoice_file IS NOT NULL 
  AND invoice_file LIKE '%bantal-assets/%';

-- Update tax_invoice_file: Extract path after 'bantal-assets/'
UPDATE asset 
SET tax_invoice_file = REGEXP_REPLACE(tax_invoice_file, '^.*bantal-assets/', '', 'g')
WHERE tax_invoice_file IS NOT NULL 
  AND tax_invoice_file LIKE '%bantal-assets/%';

-- Verify the changes
SELECT 
    asset_code,
    photo_url,
    invoice_file,
    tax_invoice_file
FROM asset
WHERE photo_url IS NOT NULL OR invoice_file IS NOT NULL OR tax_invoice_file IS NOT NULL;
```

**Expected Result:**
- Before: `http://minio:9000/bantal-assets/images/2026/SAR-26-INV-001/photo.jpg`
- After: `images/2026/SAR-26-INV-001/photo.jpg`

### Step 2: Configure MinIO Public Access

You have two options:

#### Option A: Use Localhost for Development (Recommended for Local Dev)

Update docker-compose.yaml:

```yaml
# MinIO Public URL (for browser access)
- MINIO_PUBLIC_URL=http://localhost:9100
```

Then restart:
```bash
docker-compose restart backend
```

**Pros:** Works immediately on your local machine
**Cons:** Won't work from other machines or production

#### Option B: Set Up Reverse Proxy for Production

Keep the current setting:
```yaml
- MINIO_PUBLIC_URL=https://minio.centri.id
```

But ensure you have a reverse proxy (Nginx/Caddy) that forwards `minio.centri.id` to your MinIO instance.

**Nginx Configuration Example:**

```nginx
server {
    listen 443 ssl;
    server_name minio.centri.id;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Increase timeouts for large files
    client_max_body_size 100M;
    proxy_connect_timeout 300;
    proxy_send_timeout 300;
    proxy_read_timeout 300;

    location / {
        proxy_pass http://localhost:9100;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # MinIO specific
        proxy_buffering off;
        proxy_request_buffering off;
    }
}
```

### Step 3: Verify MinIO is Accessible

Test that MinIO is accessible from the browser:

**For localhost:**
```bash
# Should return MinIO health status
curl http://localhost:9100/minio/health/live
```

**For production:**
```bash
# Should return MinIO health status
curl https://minio.centri.id/minio/health/live
```

### Step 4: Test Presigned URLs

1. **Upload a new asset** with an image
2. **View the asset detail page**
3. **Check browser network tab** - You should see:
   - Request to `/api/assets/:id/files` (succeeds)
   - Response contains presigned URL like:
     ```
     https://minio.centri.id/bantal-assets/images/2026/...?X-Amz-Algorithm=...
     ```
   - Image loads successfully from MinIO

### Step 5: Verify Database Storage

Check that new assets store only paths:

```sql
SELECT 
    asset_code,
    photo_url,
    created_at
FROM asset
ORDER BY created_at DESC
LIMIT 5;
```

**Expected:** `photo_url` should be like `images/2026/SAR-26-INV-001/photo.jpg` (no URL prefix)

## Quick Fix for Local Development

If you just want to test locally right now:

```bash
# 1. Update docker-compose.yaml
cd /home/sar-developer/Public/dev/bantal-dev/BANTAL-BE

# Edit docker-compose.yaml and change:
# - MINIO_PUBLIC_URL=https://minio.centri.id
# to:
# - MINIO_PUBLIC_URL=http://localhost:9100

# 2. Restart backend
docker-compose restart backend

# 3. Fix existing data
docker exec -it postgres-db psql -U postgres -d bantal_db -c "
UPDATE asset 
SET photo_url = REGEXP_REPLACE(photo_url, '^.*bantal-assets/', '', 'g')
WHERE photo_url LIKE '%bantal-assets/%';
"

# 4. Upload a new asset and test
```

## Understanding the URLs

### How It Works Now:

1. **Upload:** File uploaded to MinIO at `images/2026/SAR-26-INV-001/photo.jpg`
2. **Database:** Stores path only: `images/2026/SAR-26-INV-001/photo.jpg`
3. **Presigned URL Request:** Backend generates:
   ```
   http://localhost:9100/bantal-assets/images/2026/SAR-26-INV-001/photo.jpg?X-Amz-Algorithm=...
   ```
4. **Browser:** Accesses file directly from MinIO using signed URL

### Why This is Secure:

- ✅ URLs expire after 1 hour
- ✅ URLs are cryptographically signed
- ✅ Authentication required to get URL
- ✅ Cannot access files without presigned URL

### Why You Need Public URL:

- ❌ `minio:9000` only works inside Docker network
- ✅ `localhost:9100` works on your dev machine
- ✅ `https://minio.centri.id` works from anywhere (if DNS/proxy configured)

## Production Deployment Checklist

- [ ] Set up DNS for `minio.centri.id` pointing to your server
- [ ] Configure reverse proxy (Nginx/Caddy) to forward to MinIO
- [ ] Set up SSL certificate for `minio.centri.id`
- [ ] Update `MINIO_PUBLIC_URL` in production environment
- [ ] Run database migration to fix existing URLs
- [ ] Test presigned URLs work from external network
- [ ] Verify file uploads and downloads
- [ ] Monitor MinIO access logs

## Troubleshooting

### Issue: "ERR_NAME_NOT_RESOLVED"
**Cause:** Browser can't resolve `minio:9000` (Docker hostname)
**Fix:** Use `localhost:9100` for local dev or set up proper DNS for production

### Issue: Double URL encoding
**Cause:** Database has full URLs instead of paths
**Fix:** Run the SQL migration above

### Issue: "Access Denied" or 403
**Cause:** Presigned URL signature invalid or expired
**Fix:** Ensure system clocks are synchronized, check MinIO credentials

### Issue: URLs expire too quickly
**Solution:** Increase expiry time in `assets.service.ts`:
```typescript
const expirySeconds = 86400; // 24 hours instead of 1 hour
```

## Files Modified

- `BANTAL-BE/src/modules/minio/minio.service.ts` - Added MINIO_PUBLIC_URL support
- `BANTAL-BE/src/modules/assets/assets.service.ts` - Store paths only
- `BANTAL-BE/docker-compose.yaml` - Added MINIO_PUBLIC_URL env var
- `BANTAL-BE/fix-asset-urls.sql` - Migration script

## Next Steps

1. Choose Option A (localhost) or Option B (production proxy)
2. Run database migration
3. Test with new asset upload
4. Verify images load correctly
5. Plan production deployment if needed
