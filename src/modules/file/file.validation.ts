import { z } from "zod";

export const uploadFileSchema = z.object({
  body: z.object({
    folderId: z.string({ error: "Folder ID is required" }),
    name: z.string().max(255).trim().optional(),
  }),
});

export const renameFileSchema = z.object({
  params: z.object({
    fileId: z.string({ error: "File ID is required" }),
  }),
  body: z.object({
    name: z
      .string({ error: "File name is required" })
      .min(1, "File name cannot be empty")
      .max(255, "File name must be at most 255 characters")
      .trim(),
  }),
});

export const copyFileSchema = z.object({
  params: z.object({
    fileId: z.string({ error: "File ID is required" }),
  }),
  body: z.object({
    targetFolderId: z.string({ error: "Target folder ID is required" }),
  }),
});

export const duplicateFileSchema = z.object({
  params: z.object({
    fileId: z.string({ error: "File ID is required" }),
  }),
});

export const deleteFileSchema = z.object({
  params: z.object({
    fileId: z.string({ error: "File ID is required" }),
  }),
});

export const shareFileSchema = z.object({
  params: z.object({
    fileId: z.string({ error: "File ID is required" }),
  }),
});

export const toggleFavoriteSchema = z.object({
  params: z.object({
    fileId: z.string({ error: "File ID is required" }),
  }),
});

export const togglePrivateSchema = z.object({
  params: z.object({
    fileId: z.string({ error: "File ID is required" }),
  }),
  body: z.object({
    privateFolderId: z.string().optional(),
    targetFolderId: z.string().optional(),
  }),
});

export const getFilesByFolderSchema = z.object({
  params: z.object({
    folderId: z.string({ error: "Folder ID is required" }),
  }),
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const searchFilesSchema = z.object({
  query: z.object({
    name: z.string().optional(),
    type: z.enum(["note", "image", "pdf"]).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const getSharedFileSchema = z.object({
  params: z.object({
    shareToken: z.string({ error: "Share token is required" }),
  }),
});
