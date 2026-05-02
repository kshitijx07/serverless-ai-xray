terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

module "s3" {
  source       = "./modules/s3"
  project_name = var.project_name
  environment  = var.environment
}

module "dynamodb" {
  source       = "./modules/dynamodb"
  project_name = var.project_name
  environment  = var.environment
}

module "lambda" {
  source             = "./modules/lambda"
  project_name       = var.project_name
  environment        = var.environment
  s3_bucket_id       = module.s3.bucket_id
  s3_bucket_arn      = module.s3.bucket_arn
  dynamodb_table_name= module.dynamodb.table_name
  dynamodb_table_arn = module.dynamodb.table_arn
}

module "api_gateway" {
  source                     = "./modules/api_gateway"
  project_name               = var.project_name
  environment                = var.environment
  generate_url_lambda_invoke = module.lambda.generate_url_invoke_arn
  generate_url_lambda_name   = module.lambda.generate_url_function_name
  get_result_lambda_invoke   = module.lambda.get_result_invoke_arn
  get_result_lambda_name     = module.lambda.get_result_function_name
  aws_region                 = var.aws_region
}

module "frontend_hosting" {
  source       = "./modules/frontend_hosting"
  project_name = var.project_name
  environment  = var.environment
}
