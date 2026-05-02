output "generate_url_invoke_arn" {
  value = aws_lambda_function.generate_url.invoke_arn
}

output "generate_url_function_name" {
  value = aws_lambda_function.generate_url.function_name
}

output "get_result_invoke_arn" {
  value = aws_lambda_function.get_result.invoke_arn
}

output "get_result_function_name" {
  value = aws_lambda_function.get_result.function_name
}
