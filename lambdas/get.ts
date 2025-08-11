import {
  APIGatewayEventRequestContext,
  type APIGatewayEvent,
  type APIGatewayProxyCallback,
} from "aws-lambda";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
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

    // Get object from S3
    const response = await s3.send(
      new GetObjectCommand({
        Bucket: process.env.BUCKET_NAME!,
        Key: id,
      })
    );

    if (!response.Body) {
      return callback(null, {
        statusCode: 404,
        body: JSON.stringify({ error: "Asset not found" }),
      });
    }

    // Convert stream to buffer using the correct AWS SDK v3 method
    const bytes = await response.Body.transformToByteArray();
    const body = Buffer.from(bytes).toString("base64");

    return callback(null, {
      statusCode: 200,
      headers: {
        "Content-Type": response.ContentType || "application/octet-stream",
        "Cache-Control": "public, max-age=3600",
        "Content-Length": bytes.length.toString(),
      },
      body,
      isBase64Encoded: true,
    });
  } catch (error) {
    console.error("Error in getAsset:", error);

    if (error instanceof ZodError) {
      return callback(null, {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid ID parameter" }),
      });
    }

    // Handle S3 NoSuchKey error
    if (error && typeof error === "object" && "name" in error) {
      if (error.name === "NoSuchKey" || error.name === "NotFound") {
        return callback(null, {
          statusCode: 404,
          body: JSON.stringify({ error: "Asset not found" }),
        });
      }
    }

    // Generic server error
    return callback(null, {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    });
  }
};
