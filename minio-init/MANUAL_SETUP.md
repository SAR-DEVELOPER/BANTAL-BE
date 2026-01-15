# MinIO Manual Setup Guide

This guide provides step-by-step commands to manually set up MinIO buckets, users, and policies.

## Prerequisites

1. MinIO service must be running
2. MinIO Client (`mc`) must be installed or use the MinIO container

## Option 1: Using MinIO Client from Host

### Step 1: Install MinIO Client (if not already installed)

```bash
# Download and install mc
wget https://dl.min.io/client/mc/release/linux-amd64/mc
chmod +x mc
sudo mv mc /usr/local/bin/
```

### Step 2: Configure MinIO Alias

```bash
# Set up alias for your MinIO instance
mc alias set local http://localhost:9100 ${MINIO_ROOT_USER} ${MINIO_ROOT_PASSWORD}

# Or if using environment variables from .env:
# First, source your .env file or export the variables:
export MINIO_ROOT_USER=minioadmin
export MINIO_ROOT_PASSWORD=JalanCipunagara25!

# Then set the alias
mc alias set local http://localhost:9100 $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD
```

### Step 3: Create Buckets

```bash
# Create all required buckets
mc mb local/bantal-assets
mc mb local/bantal-documents
mc mb local/bantal-uploads
```

### Step 4: Create Backend User

```bash
# Set user credentials (or use from .env)
export MINIO_BACKEND_USER=bantal-backend
export MINIO_BACKEND_PASSWORD=JalanCipunagara25!

# Create the user
mc admin user add local $MINIO_BACKEND_USER $MINIO_BACKEND_PASSWORD
```

### Step 5: Create Policy File

```bash
# Create policy JSON file
cat > /tmp/bantal-backend-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::bantal-assets/*",
        "arn:aws:s3:::bantal-documents/*",
        "arn:aws:s3:::bantal-uploads/*",
        "arn:aws:s3:::bantal-assets",
        "arn:aws:s3:::bantal-documents",
        "arn:aws:s3:::bantal-uploads"
      ]
    }
  ]
}
EOF
```

### Step 6: Add Policy to MinIO

```bash
# Add the policy
mc admin policy add local bantal-backend-policy /tmp/bantal-backend-policy.json

# Attach policy to user
mc admin policy set local bantal-backend-policy user=$MINIO_BACKEND_USER
```

### Step 7: Set Bucket Policies (Make Private)

```bash
# Set all buckets to private (no public access)
mc anonymous set none local/bantal-assets
mc anonymous set none local/bantal-documents
mc anonymous set none local/bantal-uploads
```

### Step 8: Verify Setup

```bash
# List buckets
mc ls local

# List users
mc admin user list local

# List policies
mc admin policy list local

# Check user policies
mc admin policy info local bantal-backend-policy
```

---

## Option 2: Using Docker Exec (If MinIO is Running in Docker)

### Step 1: Access MinIO Container

```bash
# Execute commands inside the MinIO container using mc
docker exec -it minio mc alias set local http://localhost:9000 ${MINIO_ROOT_USER} ${MINIO_ROOT_PASSWORD}
```

### Step 2: Create Buckets

```bash
docker exec -it minio mc mb local/bantal-assets
docker exec -it minio mc mb local/bantal-documents
docker exec -it minio mc mb local/bantal-uploads
```

### Step 3: Create User

```bash
docker exec -it minio mc admin user add local bantal-backend JalanCipunagara25!
```

### Step 4: Create and Add Policy

```bash
# Create policy file on host first
cat > /tmp/bantal-backend-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::bantal-assets/*",
        "arn:aws:s3:::bantal-documents/*",
        "arn:aws:s3:::bantal-uploads/*",
        "arn:aws:s3:::bantal-assets",
        "arn:aws:s3:::bantal-documents",
        "arn:aws:s3:::bantal-uploads"
      ]
    }
  ]
}
EOF

# Copy policy file to container
docker cp /tmp/bantal-backend-policy.json minio:/tmp/bantal-backend-policy.json

# Add policy
docker exec -it minio mc admin policy add local bantal-backend-policy /tmp/bantal-backend-policy.json

# Attach policy to user
docker exec -it minio mc admin policy set local bantal-backend-policy user=bantal-backend
```

### Step 5: Set Bucket Policies

```bash
docker exec -it minio mc anonymous set none local/bantal-assets
docker exec -it minio mc anonymous set none local/bantal-documents
docker exec -it minio mc anonymous set none local/bantal-uploads
```

### Step 6: Verify

```bash
docker exec -it minio mc ls local
docker exec -it minio mc admin user list local
docker exec -it minio mc admin policy list local
```

---

## Option 3: Using MinIO Console (Web UI)

1. Access MinIO Console at `http://localhost:9101`
2. Login with root credentials:
   - Username: `minioadmin` (or value from `MINIO_ROOT_USER`)
   - Password: Value from `MINIO_ROOT_PASSWORD`
3. Navigate to **Buckets** → **Create Bucket** and create:
   - `bantal-assets`
   - `bantal-documents`
   - `bantal-uploads`
4. Navigate to **Identity** → **Users** → **Create User**:
   - Access Key: `bantal-backend`
   - Secret Key: `JalanCipunagara25!`
5. Navigate to **Identity** → **Policies** → **Create Policy**:
   - Policy Name: `bantal-backend-policy`
   - Copy the JSON policy from Step 5 above
6. Attach the policy to the user
7. Set bucket access policies to private

---

## Quick Reference: All Commands in One Block

```bash
# Set environment variables (or source from .env)
export MINIO_ROOT_USER=minioadmin
export MINIO_ROOT_PASSWORD=JalanCipunagara25!
export MINIO_BACKEND_USER=bantal-backend
export MINIO_BACKEND_PASSWORD=JalanCipunagara25!

# Configure alias (if using mc from host)
mc alias set local http://localhost:9100 $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD

# Create buckets
mc mb local/bantal-assets
mc mb local/bantal-documents
mc mb local/bantal-uploads

# Create user
mc admin user add local $MINIO_BACKEND_USER $MINIO_BACKEND_PASSWORD

# Create policy file
cat > /tmp/bantal-backend-policy.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::bantal-assets/*",
        "arn:aws:s3:::bantal-documents/*",
        "arn:aws:s3:::bantal-uploads/*",
        "arn:aws:s3:::bantal-assets",
        "arn:aws:s3:::bantal-documents",
        "arn:aws:s3:::bantal-uploads"
      ]
    }
  ]
}
EOF

# Add policy
mc admin policy add local bantal-backend-policy /tmp/bantal-backend-policy.json

# Attach policy to user
mc admin policy set local bantal-backend-policy user=$MINIO_BACKEND_USER

# Set buckets to private
mc anonymous set none local/bantal-assets
mc anonymous set none local/bantal-documents
mc anonymous set none local/bantal-uploads

# Verify
mc ls local
mc admin user list local
mc admin policy list local
```

---

## Troubleshooting

### Error: "Unable to initialize new alias"

- Make sure MinIO is running: `docker ps | grep minio`
- Check if the port is correct (9100 for API)
- Verify credentials are correct

### Error: "Bucket already exists"

- Use `--ignore-existing` flag: `mc mb local/bantal-assets --ignore-existing`
- Or delete and recreate: `mc rb local/bantal-assets --force`

### Error: "User already exists"

- Delete existing user: `mc admin user remove local bantal-backend`
- Then recreate the user

### Error: "Policy already exists"

- Delete existing policy: `mc admin policy remove local bantal-backend-policy`
- Then recreate the policy

---

## Notes

- Replace `localhost:9100` with your MinIO endpoint if different
- All credentials should match your `.env` file values
- The policy grants full access (read/write/delete/list) to all three buckets
- Buckets are set to private by default for security
