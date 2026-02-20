import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";
import { v4 as uuidv4 } from "uuid";
import { envVars } from "../config/env";
import httpStatus from "http-status";
import AppError from "../utils/AppError";

const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  note: [
    "text/plain",
    "text/markdown",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  image: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "image/bmp",
    "image/tiff",
  ],
  pdf: ["application/pdf"],
};

const ALLOWED_EXTENSIONS: Record<string, string[]> = {
  note: [".txt", ".md", ".doc", ".docx"],
  image: [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".svg",
    ".bmp",
    ".tiff",
    ".tif",
  ],
  pdf: [".pdf"],
};

const ALL_ALLOWED_MIMES = Object.values(ALLOWED_MIME_TYPES).flat();

const ALL_ALLOWED_EXTENSIONS = Object.values(ALLOWED_EXTENSIONS).flat();

export const getFileType = (mimeType: string): "note" | "image" | "pdf" => {
  if (ALLOWED_MIME_TYPES.note.includes(mimeType)) return "note";
  if (ALLOWED_MIME_TYPES.image.includes(mimeType)) return "image";
  if (ALLOWED_MIME_TYPES.pdf.includes(mimeType)) return "pdf";
  throw new AppError(
    httpStatus.BAD_REQUEST,
    `Unsupported file type: ${mimeType}`,
  );
};

const ensureUploadDir = (subDir: string): string => {
  const uploadPath = path.join(envVars.UPLOAD_DIR, subDir);
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  return uploadPath;
};

const storage = multer.diskStorage({
  destination: (
    _req: Request,
    _file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void,
  ) => {
    const uploadPath = ensureUploadDir("files");
    cb(null, uploadPath);
  },
  filename: (
    _req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void,
  ) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

const profileStorage = multer.diskStorage({
  destination: (
    _req: Request,
    _file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void,
  ) => {
    const uploadPath = ensureUploadDir("profiles");
    cb(null, uploadPath);
  },
  filename: (
    _req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void,
  ) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeAllowed = ALL_ALLOWED_MIMES.includes(file.mimetype);
  const extAllowed = ALL_ALLOWED_EXTENSIONS.includes(ext);

  if (mimeAllowed && extAllowed) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        httpStatus.BAD_REQUEST,
        `File type not allowed. Allowed: ${ALL_ALLOWED_EXTENSIONS.join(", ")}`,
      ),
    );
  }
};

const profileImageFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void => {
  const allowedMimes = ALLOWED_MIME_TYPES.image;
  const allowedExts = ALLOWED_EXTENSIONS.image;
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        httpStatus.BAD_REQUEST,
        "Only image files are allowed for profile pictures.",
      ),
    );
  }
};

export const uploadFile = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

export const uploadProfileImage = multer({
  storage: profileStorage,
  fileFilter: profileImageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
