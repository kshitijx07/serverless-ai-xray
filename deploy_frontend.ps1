$ErrorActionPreference = "Stop"

Write-Host "Building React Frontend..."
cd frontend
npm run build

Write-Host "Getting CloudFront & S3 details from Terraform..."
cd ..\infrastructure
$BUCKET_NAME = terraform output -raw frontend_bucket_name
$CLOUDFRONT_ID = terraform output -raw cloudfront_distribution_id
$CLOUDFRONT_URL = terraform output -raw frontend_url

Write-Host "Deploying to S3 Bucket: $BUCKET_NAME"
aws s3 sync ..\frontend\dist s3://$BUCKET_NAME --delete

Write-Host "Invalidating CloudFront Cache: $CLOUDFRONT_ID"
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"

Write-Host "========================================="
Write-Host "✅ Deployment Complete!"
Write-Host "🌍 Live URL: https://$CLOUDFRONT_URL"
Write-Host "========================================="
