import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

export const handler = async (event) => {
  try {
    const scanId = event.pathParameters?.scan_id;
    if (!scanId) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "scan_id is required" })
      };
    }

    const tableName = process.env.TABLE_NAME;

    const response = await docClient.send(new GetCommand({
      TableName: tableName,
      Key: { scan_id: scanId }
    }));

    if (!response.Item) {
      return {
        statusCode: 404,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Result not found" })
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,GET"
      },
      body: JSON.stringify(response.Item)
    };
  } catch (error) {
    console.error("Error fetching result:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Internal Server Error" })
    };
  }
};
