$ErrorActionPreference = "Stop"

Write-Host "Getting S3 Bucket Name..."
cd infrastructure
$BUCKET_NAME = terraform output -raw s3_bucket_name
cd ..

$ZIP_URL = "https://storage.googleapis.com/download.tensorflow.org/models/tflite/mobilenet_v1_1.0_224_quant_and_labels.zip"
$ZIP_FILE = "model.zip"

Write-Host "Downloading Pre-Trained Model from Google Storage..."
Invoke-WebRequest -Uri $ZIP_URL -OutFile $ZIP_FILE

Write-Host "Extracting model..."
Expand-Archive -Path $ZIP_FILE -DestinationPath "model_extract" -Force
$LOCAL_MODEL = "model_extract\mobilenet_v1_1.0_224_quant.tflite"

Write-Host "Uploading Model to S3: s3://$BUCKET_NAME/models/pneumonia.tflite"
aws s3 cp $LOCAL_MODEL s3://$BUCKET_NAME/models/pneumonia.tflite

Write-Host "Model Uploaded Successfully!"
