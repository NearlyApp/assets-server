import {
  APIGatewayEventRequestContext,
  type APIGatewayEvent,
  type APIGatewayProxyCallback,
} from "aws-lambda";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { idParameter } from "../utils/zod";
import { ZodError } from "zod";

const s3 = new S3Client();

export const handler = async (
  event: APIGatewayEvent,
  context: APIGatewayEventRequestContext,
  callback: APIGatewayProxyCallback
) => {
  try {
    // Validate the ID parameter
    const id = idParameter.parse(event.pathParameters?.id);

    // Delete object from S3
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.BUCKET_NAME!,
        Key: id,
      })
    );

    return callback(null, {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Asset deleted successfully",
      }),
    });
  } catch (error) {
    console.error("Error in deleteResource:", error);

    if (error instanceof ZodError) {
      return callback(null, {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid ID parameter" }),
      });
    }

    // Note: S3 DeleteObject doesn't throw an error if the object doesn't exist
    // It returns success regardless, which is the expected behavior

    return callback(null, {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    });
  }
};
