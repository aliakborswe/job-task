import { z } from "zod";

export const createFolderSchema = z.object({
  body: z.object({
    name: z
      .string({ error: "Folder name is required" })
      .min(1, "Folder name cannot be empty")
      .max(80, "Folder name must be at most 80 characters")
      .trim(),
  }),
});

export const renameFolderSchema = z.object({
  params: z.object({
    folderId: z.string({ error: "Folder ID is required" }),
  }),
  body: z.object({
    name: z
      .string({ error: "Folder name is required" })
      .min(1, "Folder name cannot be empty")
      .max(80, "Folder name must be at most 80 characters")
      .trim(),
  }),
});

export const createPrivateFolderSchema = z.object({
  body: z.object({
    name: z
      .string({ error: "Folder name is required" })
      .min(1, "Folder name cannot be empty")
      .max(80, "Folder name must be at most 80 characters")
      .trim(),
    pin: z
      .string({ error: "PIN is required" })
      .regex(/^\d{4,6}$/, "PIN must be a 4 to 6 digit number"),
  }),
});

export const searchFoldersSchema = z.object({
  query: z.object({
    name: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const deleteFolderSchema = z.object({
  params: z.object({
    folderId: z.string({ error: "Folder ID is required" }),
  }),
});