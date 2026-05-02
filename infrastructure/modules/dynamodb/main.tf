resource "aws_dynamodb_table" "results" {
  name           = "${var.project_name}-results-${var.environment}"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "scan_id"

  attribute {
    name = "scan_id"
    type = "S"
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}
