output "api_gateway_url" {
  description = "The URL of the API Gateway"
  value       = module.api_gateway.api_url
}

output "s3_bucket_name" {
  value = module.s3.bucket_id
}

output "frontend_url" {
  description = "The CloudFront URL for the frontend"
  value       = module.frontend_hosting.cloudfront_domain
}

output "frontend_bucket_name" {
  value = module.frontend_hosting.frontend_bucket_name
}
output "cloudfront_distribution_id" {
  value = module.frontend_hosting.cloudfront_distribution_id
}
