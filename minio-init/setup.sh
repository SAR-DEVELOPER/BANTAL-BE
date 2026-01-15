#!/bin/sh
set -e

# Wait for MinIO to be ready
until mc alias set local http://minio:9000 ${MINIO_ROOT_USER} ${MINIO_ROOT_PASSWORD} 2>/dev/null; do
  echo "Waiting for MinIO to be ready..."
  sleep 2
done

echo "MinIO is ready. Setting up buckets, users, and policies..."

# Create buckets
echo "Creating buckets..."
mc mb local/bantal-assets --ignore-existing || true
mc mb local/bantal-documents --ignore-existing || true
mc mb local/bantal-uploads --ignore-existing || true

# Create user for backend application
echo "Creating backend user..."
mc admin user add local ${MINIO_BACKEND_USER} ${MINIO_BACKEND_PASSWORD} || true

# Create policy for backend user
echo "Creating backend policy..."
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

mc admin policy add local bantal-backend-policy /tmp/bantal-backend-policy.json || true
mc admin policy set local bantal-backend-policy user=${MINIO_BACKEND_USER} || true

# Set bucket policies (make them private by default)
echo "Setting bucket policies..."
mc anonymous set none local/bantal-assets || true
mc anonymous set none local/bantal-documents || true
mc anonymous set none local/bantal-uploads || true

echo "MinIO setup completed successfully!"
