import {
  APIGatewayEventRequestContext,
  type APIGatewayEvent,
  type APIGatewayProxyCallback,
} from "aws-lambda";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client();

// Allowed content types for images and videos
const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/avi",
] as const;

export const handler = async (
  event: APIGatewayEvent,
  context: APIGatewayEventRequestContext,
  callback: APIGatewayProxyCallback
) => {
  try {
    // Get content type from headers
    const contentType =
      event.headers["Content-Type"] || event.headers["content-type"];

    if (!contentType) {
      return callback(null, {
        statusCode: 400,
        body: JSON.stringify({ error: "Content-Type header is required" }),
      });
    }

    // Validate content type
    if (!ALLOWED_CONTENT_TYPES.includes(contentType as any)) {
      return callback(null, {
        statusCode: 400,
        body: JSON.stringify({
          error: "Invalid content type. Only images and videos are allowed",
        }),
      });
    }

    // Get file data from request body
    if (!event.body) {
      return callback(null, {
        statusCode: 400,
        body: JSON.stringify({ error: "Request body is required" }),
      });
    }

    // Generate unique key using timestamp and random number
    const fileExtension = getFileExtension(contentType);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const key = `${timestamp}-${random}${fileExtension}`;

    // Convert base64 to buffer if needed
    const buffer = event.isBase64Encoded
      ? Buffer.from(event.body, "base64")
      : Buffer.from(event.body);

    // Upload to S3
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    );

    return callback(null, {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: key,
        message: "Upload successful",
      }),
    });
  } catch (error) {
    console.error("Error in upload:", error);

    return callback(null, {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    });
  }
};

function getFileExtension(contentType: string): string {
  const extensionMap: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/quicktime": ".mov",
    "video/avi": ".avi",
  };

  return extensionMap[contentType] || "";
}
