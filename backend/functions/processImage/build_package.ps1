$ErrorActionPreference = "Stop"

Write-Host "Creating deployment package for processImage Lambda..."

$FUNCTION_DIR = "d:\Serverless AI X-ray Analyzer\backend\functions\processImage"
$PACKAGE_DIR = "$FUNCTION_DIR\package"

if (Test-Path $PACKAGE_DIR) {
    Remove-Item -Recurse -Force $PACKAGE_DIR
}
New-Item -ItemType Directory -Force -Path $PACKAGE_DIR

Write-Host "Downloading Linux native wheels for tflite-runtime, Pillow, and numpy..."
# Download Linux wheels using pip (Requires Python installed on the host)
pip install `
    --platform manylinux2014_x86_64 `
    --target=$PACKAGE_DIR `
    --implementation cp `
    --python-version 3.10 `
    --only-binary=:all: --upgrade `
    tflite-runtime Pillow numpy

Write-Host "Copying lambda_function.py to package..."
Copy-Item "$FUNCTION_DIR\lambda_function.py" -Destination $PACKAGE_DIR

Write-Host "Creating ZIP archive..."
$ZIP_PATH = "d:\Serverless AI X-ray Analyzer\infrastructure\modules\lambda\processImage.zip"
if (Test-Path $ZIP_PATH) {
    Remove-Item -Force $ZIP_PATH
}
Compress-Archive -Path "$PACKAGE_DIR\*" -DestinationPath $ZIP_PATH

Write-Host "Package created at $ZIP_PATH"
