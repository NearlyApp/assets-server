import z from "zod";

// Asset metadata schema
export const AssetMetadata = z.object({
  id: z.string(),
  filename: z.string(),
  contentType: z.string(),
  size: z.number(),
  uploadedAt: z.string().datetime(),
  dimensions: z
    .object({
      width: z.number(),
      height: z.number(),
    })
    .optional(),
  duration: z.number().optional(), // For videos
  thumbnailUrl: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  userId: z.string().optional(), // Who uploaded it
  isPublic: z.boolean().default(true),
});

// Success response for asset retrieval
export const AssetResponse = z.object({
  success: z.literal(true),
  data: z.object({
    asset: AssetMetadata,
    downloadUrl: z.string().url(), // Pre-signed URL or CDN URL
  }),
  timestamp: z.string().datetime(),
});

// Success response for asset list
export const AssetListResponse = z.object({
  success: z.literal(true),
  data: z.object({
    assets: z.array(AssetMetadata),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      hasNext: z.boolean(),
      hasPrev: z.boolean(),
    }),
  }),
  timestamp: z.string().datetime(),
});

// Success response for asset upload
export const AssetUploadResponse = z.object({
  success: z.literal(true),
  data: z.object({
    asset: AssetMetadata,
    uploadUrl: z.string().url().optional(), // Pre-signed upload URL if needed
  }),
  message: z.string(),
  timestamp: z.string().datetime(),
});

// Error response
export const ErrorResponse = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
  }),
  timestamp: z.string().datetime(),
});

// Standard API response wrapper
export const APIResponse = z.union([
  AssetResponse,
  AssetListResponse,
  AssetUploadResponse,
  ErrorResponse,
]);

// Type exports
export type AssetMetadata = z.infer<typeof AssetMetadata>;
export type AssetResponse = z.infer<typeof AssetResponse>;
export type AssetListResponse = z.infer<typeof AssetListResponse>;
export type AssetUploadResponse = z.infer<typeof AssetUploadResponse>;
export type ErrorResponse = z.infer<typeof ErrorResponse>;
export type APIResponse = z.infer<typeof APIResponse>;

// Error codes enum
export const ERROR_CODES = {
  ASSET_NOT_FOUND: "ASSET_NOT_FOUND",
  INVALID_ASSET_TYPE: "INVALID_ASSET_TYPE",
  ASSET_TOO_LARGE: "ASSET_TOO_LARGE",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  SERVER_ERROR: "SERVER_ERROR",
  STORAGE_ERROR: "STORAGE_ERROR",
} as const;

// Content type validation
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/avi",
] as const;

export const ALLOWED_CONTENT_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_VIDEO_TYPES,
] as const;

// Utility functions
export const isImageType = (contentType: string): boolean => {
  return ALLOWED_IMAGE_TYPES.includes(contentType as any);
};

export const isVideoType = (contentType: string): boolean => {
  return ALLOWED_VIDEO_TYPES.includes(contentType as any);
};

export const isAllowedContentType = (contentType: string): boolean => {
  return ALLOWED_CONTENT_TYPES.includes(contentType as any);
};
