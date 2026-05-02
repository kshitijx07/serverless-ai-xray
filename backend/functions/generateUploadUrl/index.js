import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const s3Client = new S3Client({});
const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

export const handler = async (event) => {
  try {
    const scanId = randomUUID();
    const fileName = `${scanId}.jpg`;
    const bucketName = process.env.BUCKET_NAME;
    const tableName = process.env.TABLE_NAME;

    // Generate Pre-signed URL
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      ContentType: "image/jpeg"
    });
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    // Initialize DynamoDB Record
    await docClient.send(new PutCommand({
      TableName: tableName,
      Item: {
        scan_id: scanId,
        status: "PENDING",
        created_at: new Date().toISOString()
      }
    }));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,GET"
      },
      body: JSON.stringify({ uploadUrl, scanId })
    };
  } catch (error) {
    console.error("Error generating upload URL:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Could not generate upload URL" })
    };
  }
};
