export const MAX_STORAGE_BYTES = 15 * 1024 * 1024 * 1024;

export const FILE_TYPES = {
  NOTE: "note",
  IMAGE: "image",
  PDF: "pdf",
} as const;

export type FileType = (typeof FILE_TYPES)[keyof typeof FILE_TYPES];

export const SHARE_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;
