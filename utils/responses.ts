import { type APIGatewayProxyResult } from "aws-lambda";
import {
  type AssetResponse,
  type AssetListResponse,
  type AssetUploadResponse,
  type ErrorResponse,
  ERROR_CODES,
} from "./schemas";

/**
 * Create a successful asset response
 */
export const createAssetResponse = (
  asset: AssetResponse["data"]["asset"],
  downloadUrl: string
): APIGatewayProxyResult => {
  const response: AssetResponse = {
    success: true,
    data: {
      asset,
      downloadUrl,
    },
    timestamp: new Date().toISOString(),
  };

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600", // Cache for 1 hour
    },
    body: JSON.stringify(response),
  };
};

/**
 * Create a successful asset list response
 */
export const createAssetListResponse = (
  assets: AssetListResponse["data"]["assets"],
  pagination: AssetListResponse["data"]["pagination"]
): APIGatewayProxyResult => {
  const response: AssetListResponse = {
    success: true,
    data: {
      assets,
      pagination,
    },
    timestamp: new Date().toISOString(),
  };

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(response),
  };
};

/**
 * Create a successful upload response
 */
export const createUploadResponse = (
  asset: AssetUploadResponse["data"]["asset"],
  uploadUrl?: string,
  message = "Asset uploaded successfully"
): APIGatewayProxyResult => {
  const response: AssetUploadResponse = {
    success: true,
    data: {
      asset,
      ...(uploadUrl && { uploadUrl }),
    },
    message,
    timestamp: new Date().toISOString(),
  };

  return {
    statusCode: 201,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(response),
  };
};

/**
 * Create an error response
 */
export const createErrorResponse = (
  code: keyof typeof ERROR_CODES,
  message: string,
  statusCode: number = 500,
  details?: any
): APIGatewayProxyResult => {
  const response: ErrorResponse = {
    success: false,
    error: {
      code: ERROR_CODES[code],
      message,
      ...(details && { details }),
    },
    timestamp: new Date().toISOString(),
  };

  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(response),
  };
};

/**
 * Create a 404 not found response
 */
export const createNotFoundResponse = (
  resourceType = "Asset"
): APIGatewayProxyResult => {
  return createErrorResponse(
    "ASSET_NOT_FOUND",
    `${resourceType} not found`,
    404
  );
};

/**
 * Create a validation error response
 */
export const createValidationErrorResponse = (
  details: any
): APIGatewayProxyResult => {
  return createErrorResponse(
    "VALIDATION_ERROR",
    "Invalid request parameters",
    400,
    details
  );
};

/**
 * Create an unauthorized response
 */
export const createUnauthorizedResponse = (): APIGatewayProxyResult => {
  return createErrorResponse("UNAUTHORIZED", "Authentication required", 401);
};

/**
 * Create a forbidden response
 */
export const createForbiddenResponse = (
  message = "Access denied"
): APIGatewayProxyResult => {
  return createErrorResponse("FORBIDDEN", message, 403);
};

/**
 * Create a server error response
 */
export const createServerErrorResponse = (
  message = "Internal server error"
): APIGatewayProxyResult => {
  return createErrorResponse("SERVER_ERROR", message, 500);
};
