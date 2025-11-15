import {
  APIGatewayEventRequestContext,
  type APIGatewayEvent,
  type APIGatewayProxyCallback,
} from "aws-lambda";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ALLOWED_CONTENT_TYPES } from "../config";

const s3 = new S3Client();

export const handler = async (
  event: APIGatewayEvent,
  context: APIGatewayEventRequestContext,
  callback: APIGatewayProxyCallback
) => {
  try {
    // Parse the request body to get content type
    let requestBody;
    try {
      requestBody = event.isBase64Encoded
        ? JSON.parse(Buffer.from(event.body!, "base64").toString("utf-8"))
        : JSON.parse(event.body || "{}");
    } catch (error) {
      console.error("Error parsing JSON:", error, event, event.body);
      return callback(null, {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ error: "Invalid JSON in request body" }),
      });
    }

    const { contentType } = requestBody;

    if (!contentType) {
      return callback(null, {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error: "contentType field is required in request body",
        }),
      });
    }

    // Validate content type
    if (!ALLOWED_CONTENT_TYPES.includes(contentType as any)) {
      return callback(null, {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error: "Invalid content type. Only images and videos are allowed",
        }),
      });
    }

    // Generate unique key using timestamp and random number (same logic as upload)
    const fileExtension = getFileExtension(contentType);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const key = `${timestamp}-${random}${fileExtension}`;

    // Create presigned URL for PUT operation
    const command = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME!,
      Key: key,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(s3, command, {
      expiresIn: 3600, // URL expires in 1 hour
    });

    return callback(null, {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: key,
        presignedUrl,
        contentType,
        expiresIn: 3600,
        message: "Presigned URL generated successfully",
      }),
    });
  } catch (error) {
    console.error("Error in presigned upload:", error);

    return callback(null, {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
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
