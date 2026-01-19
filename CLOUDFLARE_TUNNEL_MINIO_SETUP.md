# MinIO Setup with Cloudflare Tunnel

## Overview

Add MinIO to your existing Cloudflare Tunnel configuration to expose it at `minio.centri.id`.

## Setup Steps

### Step 1: Add DNS Record in Cloudflare

Go to Cloudflare DNS settings for `centri.id` domain:

```
Type: CNAME
Name: minio
Content: YOUR_TUNNEL_ID.cfargotunnel.com
Proxy: ON (orange cloud enabled)
TTL: Auto
```

**Note:** The tunnel ID should be the same as your existing tunnel for `web.centri.id` and `api.centri.id`.

### Step 2: Update Cloudflare Tunnel Configuration

Add MinIO to your tunnel config. This depends on how you're managing your tunnel:

#### Option A: Using Cloudflare Dashboard (Zero Trust)

1. Go to **Cloudflare Zero Trust** → **Access** → **Tunnels**
2. Click on your existing tunnel
3. Click **Public Hostname** tab
4. Click **Add a public hostname**
5. Configure:
   - **Subdomain:** `minio`
   - **Domain:** `centri.id`
   - **Service Type:** `HTTP`
   - **URL:** `localhost:9100`
6. Click **Save**

#### Option B: Using config.yml File

Edit your tunnel configuration file (usually at `/etc/cloudflared/config.yml` or `~/.cloudflared/config.yml`):

```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: /path/to/credentials.json

ingress:
  # Add this new rule for MinIO
  - hostname: minio.centri.id
    service: http://localhost:9100
    originRequest:
      noTLSVerify: true
      connectTimeout: 30s
      # Increase timeouts for large file uploads
      http2Origin: false
  
  # Your existing rules
  - hostname: api.centri.id
    service: http://localhost:4000
  
  - hostname: web.centri.id
    service: http://localhost:3000
  
  # Catch-all rule (must be last)
  - service: http_status:404
```

Then restart the tunnel:

```bash
sudo systemctl restart cloudflared
# or
cloudflared tunnel restart
```

### Step 3: Verify MinIO is Accessible

```bash
# Test from your server
curl http://localhost:9100/minio/health/live

# Test from outside (after DNS propagates, ~5 minutes)
curl https://minio.centri.id/minio/health/live
```

### Step 4: Test Presigned URLs

The backend is already configured with `MINIO_PUBLIC_URL=https://minio.centri.id`, so:

1. **Upload a new asset** with an image
2. **View the asset detail page**
3. **Check browser network tab** - Should see requests to:
   ```
   https://minio.centri.id/bantal-assets/images/2026/...?X-Amz-Algorithm=...
   ```
4. **Images should load** successfully

### Step 5: Fix Existing Asset Data (if needed)

If you have existing assets with full URLs in the database:

```bash
docker exec -it postgres-db psql -U postgres -d bantal_db -c "
UPDATE asset 
SET photo_url = REGEXP_REPLACE(photo_url, '^.*bantal-assets/', '', 'g')
WHERE photo_url LIKE '%bantal-assets/%';

UPDATE asset 
SET invoice_file = REGEXP_REPLACE(invoice_file, '^.*bantal-assets/', '', 'g')
WHERE invoice_file LIKE '%bantal-assets/%';

UPDATE asset 
SET tax_invoice_file = REGEXP_REPLACE(tax_invoice_file, '^.*bantal-assets/', '', 'g')
WHERE tax_invoice_file LIKE '%bantal-assets/%';
"
```

## Cloudflare Tunnel Benefits

✅ **No open ports** - Everything goes through Cloudflare's secure tunnel
✅ **Automatic HTTPS** - SSL handled by Cloudflare
✅ **DDoS Protection** - Built-in with Cloudflare
✅ **Global CDN** - Fast access from anywhere
✅ **No firewall changes** - Works behind NAT/firewall

## Configuration Summary

```
Browser → Cloudflare CDN → Cloudflare Tunnel → localhost:9100 (MinIO)
```

**Your setup:**
- `web.centri.id` → `localhost:3000` (Frontend)
- `api.centri.id` → `localhost:4000` (Backend)
- `minio.centri.id` → `localhost:9100` (MinIO) ← **NEW**

## Troubleshooting

### Issue: "DNS_PROBE_FINISHED_NXDOMAIN"

**Cause:** DNS not propagated yet

**Fix:** Wait 5-10 minutes, then clear DNS cache:
```bash
# On your machine
sudo systemd-resolve --flush-caches
# or
sudo dnsmasq --clear-cache
```

### Issue: "502 Bad Gateway"

**Cause:** Tunnel can't reach MinIO

**Fix:**
```bash
# Check MinIO is running
docker ps | grep minio

# Check MinIO is accessible locally
curl http://localhost:9100/minio/health/live

# Check tunnel logs
sudo journalctl -u cloudflared -f
```

### Issue: "Connection timeout" on large files

**Cause:** Default timeouts too short

**Fix:** Add to tunnel config:
```yaml
- hostname: minio.centri.id
  service: http://localhost:9100
  originRequest:
    connectTimeout: 60s
    noHappyEyeballs: true
```

### Issue: CORS errors

**Cause:** MinIO CORS not configured

**Fix:** MinIO bucket policies should allow CORS. The presigned URLs should work regardless, but if you need to configure CORS:

```bash
# Connect to MinIO container
docker exec -it minio mc alias set myminio http://localhost:9000 $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD

# Set bucket CORS
docker exec -it minio mc anonymous set-json /path/to/cors-policy.json myminio/bantal-assets
```

## Security Considerations

### Current Setup (Recommended)
- ✅ Presigned URLs provide time-limited access (1 hour)
- ✅ Authentication required to generate URLs
- ✅ URLs are cryptographically signed
- ✅ Cloudflare provides DDoS protection

### Optional: Add Cloudflare Access (Zero Trust)

For additional security, you can require Cloudflare Access authentication:

1. Go to **Cloudflare Zero Trust** → **Access** → **Applications**
2. Click **Add an application**
3. Choose **Self-hosted**
4. Configure:
   - **Application name:** MinIO
   - **Subdomain:** `minio`
   - **Domain:** `centri.id`
5. Set access policies (e.g., email domain, IP range)

**Note:** This will require authentication for ALL MinIO access, including presigned URLs. Only use if you need extra security.

## Monitoring

### Check Tunnel Status

```bash
# View tunnel status
sudo systemctl status cloudflared

# View tunnel logs
sudo journalctl -u cloudflared -f

# Test connectivity
cloudflared tunnel info YOUR_TUNNEL_ID
```

### Monitor MinIO Access

```bash
# MinIO logs
docker logs -f minio

# Check MinIO metrics
curl https://minio.centri.id/minio/v2/metrics/cluster
```

## Performance Optimization

### Enable Cloudflare Caching (Optional)

For faster global access, enable caching in Cloudflare:

1. Go to **Cloudflare Dashboard** → **Caching** → **Configuration**
2. Add a **Cache Rule** for `minio.centri.id/*`
3. Set cache TTL (e.g., 1 hour for images)

**Note:** Presigned URLs already have expiry, so caching is safe.

## Quick Reference

```bash
# Restart tunnel
sudo systemctl restart cloudflared

# View tunnel config
cat ~/.cloudflared/config.yml

# Test MinIO locally
curl http://localhost:9100/minio/health/live

# Test MinIO via tunnel
curl https://minio.centri.id/minio/health/live

# Check tunnel logs
sudo journalctl -u cloudflared -n 50
```

## Next Steps

1. ✅ Add DNS record in Cloudflare
2. ✅ Update tunnel configuration
3. ✅ Restart tunnel
4. ✅ Test MinIO access
5. ✅ Upload new asset and verify images load
6. ✅ Fix existing asset URLs in database (if needed)
7. ⏭️ Monitor performance
8. ⏭️ Consider enabling Cloudflare caching

## Related Files

- `BANTAL-BE/docker-compose.yaml` - MinIO container configuration
- `BANTAL-BE/FIX_PRESIGNED_URLS.md` - Presigned URL troubleshooting
- `BANTAL-BE/MINIO_PUBLIC_URL_FIX.md` - MinIO URL configuration
- `BANTAL-BE/fix-asset-urls.sql` - Database migration script
