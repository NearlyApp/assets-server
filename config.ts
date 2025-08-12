export const environments = [
  {
    stage: "dev",
    recordName: "dev.assets.nearly",
  },
  {
    stage: "prod",
    recordName: "assets.nearly",
  },
];

// Allowed content types for images and videos
export const ALLOWED_CONTENT_TYPES = [
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

export const config = {
  hostedZone: "teamzbl.com",
};
