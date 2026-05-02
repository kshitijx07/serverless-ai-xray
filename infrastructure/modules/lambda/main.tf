# IAM Role for Node.js Lambdas
resource "aws_iam_role" "lambda_exec" {
  name = "${var.project_name}-lambda-exec-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "lambda_s3_dynamo" {
  name = "${var.project_name}-lambda-policy-${var.environment}"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject"
        ]
        Resource = "${var.s3_bucket_arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:UpdateItem",
          "dynamodb:Scan"
        ]
        Resource = var.dynamodb_table_arn
      }
    ]
  })
}

# Generate Upload URL Lambda
data "archive_file" "generate_url_zip" {
  type        = "zip"
  source_dir  = "${path.root}/../backend/functions/generateUploadUrl"
  output_path = "${path.module}/generateUploadUrl.zip"
}

resource "aws_lambda_function" "generate_url" {
  filename         = data.archive_file.generate_url_zip.output_path
  function_name    = "${var.project_name}-generate-url-${var.environment}"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "index.handler"
  runtime          = "nodejs18.x"
  source_code_hash = data.archive_file.generate_url_zip.output_base64sha256

  environment {
    variables = {
      BUCKET_NAME = var.s3_bucket_id
      TABLE_NAME  = var.dynamodb_table_name
    }
  }
}

# Get Result Lambda
data "archive_file" "get_result_zip" {
  type        = "zip"
  source_dir  = "${path.root}/../backend/functions/getResult"
  output_path = "${path.module}/getResult.zip"
}

resource "aws_lambda_function" "get_result" {
  filename         = data.archive_file.get_result_zip.output_path
  function_name    = "${var.project_name}-get-result-${var.environment}"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "index.handler"
  runtime          = "nodejs18.x"
  source_code_hash = data.archive_file.get_result_zip.output_base64sha256

  environment {
    variables = {
      TABLE_NAME = var.dynamodb_table_name
    }
  }
}

# Process Image Lambda (Python)
# ZIP is pre-built using build_package.ps1 to include native Linux wheels
resource "aws_lambda_function" "process_image" {
  filename         = "${path.module}/processImage.zip"
  function_name    = "${var.project_name}-process-image-${var.environment}"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "lambda_function.lambda_handler"
  runtime          = "python3.10"
  timeout          = 30
  memory_size      = 512
  source_code_hash = filebase64sha256("${path.module}/processImage.zip")

  environment {
    variables = {
      TABLE_NAME  = var.dynamodb_table_name
      BUCKET_NAME = var.s3_bucket_id
    }
  }
}

# S3 Trigger for Process Image Lambda
resource "aws_lambda_permission" "allow_s3" {
  statement_id  = "AllowExecutionFromS3Bucket"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.process_image.arn
  principal     = "s3.amazonaws.com"
  source_arn    = var.s3_bucket_arn
}

resource "aws_s3_bucket_notification" "bucket_notification" {
  bucket = var.s3_bucket_id

  lambda_function {
    lambda_function_arn = aws_lambda_function.process_image.arn
    events              = ["s3:ObjectCreated:*"]
  }

  depends_on = [aws_lambda_permission.allow_s3]
}
