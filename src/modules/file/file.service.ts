import httpStatus from "http-status";
import AppError from "../../utils/AppError";
import { User } from "../user/user.model";
import { envVars } from "../../config/env";
import { Folder } from "../folder/folder.model";
import { FileSearchOptions, IFile, PaginationResult } from "./file.interface";
import { copyLocalFile, deleteLocalFile } from "../../helpers/fileSystem";
import { getFileType } from "../../middlewares/upload";
import { File } from "./file.model";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { SHARE_TOKEN_EXPIRY_MS } from "../../constants";

const checkUserStorage = async (
  userId: string,
  fileSize: number,
): Promise<void> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const maxStorage = parseInt(envVars.MAX_STORAGE_BYTES);
  if (user.storageUsed + fileSize > maxStorage) {
    const remainingMB = (
      (maxStorage - user.storageUsed) /
      (1024 * 1024)
    ).toFixed(2);
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Storage quota exceeded. You have ${remainingMB} MB remaining.`,
    );
  }
};

const uploadFile = async (
  userId: string,
  folderId: string,
  file: Express.Multer.File,
  customName?: string,
): Promise<IFile> => {
  const folder = await Folder.findOne({ _id: folderId, userId });
  if (!folder) {
    deleteLocalFile(file.path);
    throw new AppError(httpStatus.NOT_FOUND, "Folder not found");
  }

  try {
    await checkUserStorage(userId, file.size);
  } catch (err) {
    deleteLocalFile(file.path);
    throw err;
  }

  const fileType = getFileType(file.mimetype);
  const fileName = customName || path.parse(file.originalname).name;

  const newFile = await File.create({
    name: fileName,
    originalName: file.originalname,
    type: fileType,
    mimeType: file.mimetype,
    size: file.size,
    path: file.path,
    userId,
    folderId: folder._id,
    isPrivate: folder.isPrivate,
  });

  await Promise.all([
    User.findByIdAndUpdate(userId, { $inc: { storageUsed: file.size } }),
    Folder.findByIdAndUpdate(folderId, { $inc: { storageUsed: file.size } }),
  ]);

  return newFile;
};

const getFilesByFolder = async (
  userId: string,
  folderId: string,
  page = 1,
  limit = 20,
): Promise<PaginationResult<IFile>> => {
  const skip = (page - 1) * limit;

  const folder = await Folder.findOne({ _id: folderId, userId });
  if (!folder) {
    throw new AppError(httpStatus.NOT_FOUND, "Folder not found");
  }

  const query = { userId, folderId: folder._id };
  const [files, total] = await Promise.all([
    File.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    File.countDocuments(query),
  ]);

  return { data: files, total, page, limit };
};

const getFileById = async (userId: string, fileId: string): Promise<IFile> => {
  const file = await File.findOne({ _id: fileId, userId });
  if (!file) {
    throw new AppError(httpStatus.NOT_FOUND, "File not found");
  }
  return file;
};

const renameFile = async (
  userId: string,
  fileId: string,
  name: string,
): Promise<IFile> => {
  const file = await File.findOne({ _id: fileId, userId });
  if (!file) {
    throw new AppError(httpStatus.NOT_FOUND, "File not found");
  }

  file.name = name;
  await file.save();
  return file;
};

const copyFile = async (
  userId: string,
  fileId: string,
  targetFolderId: string,
): Promise<IFile> => {
  const file = await File.findOne({ _id: fileId, userId });
  if (!file) {
    throw new AppError(httpStatus.NOT_FOUND, "File not found");
  }

  const targetFolder = await Folder.findOne({ _id: targetFolderId, userId });
  if (!targetFolder) {
    throw new AppError(httpStatus.NOT_FOUND, "Target folder not found");
  }

  await checkUserStorage(userId, file.size);

  const ext = path.extname(file.path);
  const newFileName = `${uuidv4()}${ext}`;
  const newPath = path.join(path.dirname(file.path), newFileName);
  copyLocalFile(file.path, newPath);

  const copiedFile = await File.create({
    name: `${file.name} (copy)`,
    originalName: file.originalName,
    type: file.type,
    mimeType: file.mimeType,
    size: file.size,
    path: newPath,
    userId,
    folderId: targetFolder._id,
    isPrivate: targetFolder.isPrivate,
  });

  await Promise.all([
    User.findByIdAndUpdate(userId, { $inc: { storageUsed: file.size } }),
    Folder.findByIdAndUpdate(targetFolderId, {
      $inc: { storageUsed: file.size },
    }),
  ]);

  return copiedFile;
};

const duplicateFile = async (
  userId: string,
  fileId: string,
): Promise<IFile> => {
  const file = await File.findOne({ _id: fileId, userId });
  if (!file) {
    throw new AppError(httpStatus.NOT_FOUND, "File not found");
  }

  await checkUserStorage(userId, file.size);

  const ext = path.extname(file.path);
  const newFileName = `${uuidv4()}${ext}`;
  const newPath = path.join(path.dirname(file.path), newFileName);
  copyLocalFile(file.path, newPath);

  const duplicatedFile = await File.create({
    name: `${file.name} (copy)`,
    originalName: file.originalName,
    type: file.type,
    mimeType: file.mimeType,
    size: file.size,
    path: newPath,
    userId,
    folderId: file.folderId,
    isPrivate: file.isPrivate,
  });

  await Promise.all([
    User.findByIdAndUpdate(userId, { $inc: { storageUsed: file.size } }),
    Folder.findByIdAndUpdate(file.folderId, {
      $inc: { storageUsed: file.size },
    }),
  ]);

  return duplicatedFile;
};

const deleteFile = async (userId: string, fileId: string): Promise<void> => {
  const file = await File.findOne({ _id: fileId, userId });
  if (!file) {
    throw new AppError(httpStatus.NOT_FOUND, "File not found");
  }

  deleteLocalFile(file.path);

  await Promise.all([
    User.findByIdAndUpdate(userId, { $inc: { storageUsed: -file.size } }),
    Folder.findByIdAndUpdate(file.folderId, {
      $inc: { storageUsed: -file.size },
    }),
  ]);

  await File.findByIdAndDelete(fileId);
};

const shareFile = async (
  userId: string,
  fileId: string,
): Promise<{ shareToken: string; expiresAt: Date }> => {
  const file = await File.findOne({ _id: fileId, userId });
  if (!file) {
    throw new AppError(httpStatus.NOT_FOUND, "File not found");
  }

  if (file.isPrivate) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Cannot share files from the private folder",
    );
  }

  const shareToken = uuidv4();
  const expiresAt = new Date(Date.now() + SHARE_TOKEN_EXPIRY_MS);

  file.shareToken = shareToken;
  file.shareTokenExpiry = expiresAt;
  await file.save();

  return { shareToken, expiresAt };
};

const getSharedFile = async (shareToken: string): Promise<IFile> => {
  const file = await File.findOne({ shareToken });
  if (!file) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Shared file not found or link has expired",
    );
  }

  if (file.shareTokenExpiry && file.shareTokenExpiry < new Date()) {
    file.shareToken = undefined;
    file.shareTokenExpiry = undefined;
    await file.save();
    throw new AppError(httpStatus.GONE, "Share link has expired");
  }

  return file;
};

const toggleFavorite = async (
  userId: string,
  fileId: string,
): Promise<IFile> => {
  const file = await File.findOne({ _id: fileId, userId });
  if (!file) {
    throw new AppError(httpStatus.NOT_FOUND, "File not found");
  }

  file.isFavorite = !file.isFavorite;
  await file.save();
  return file;
};

const getFavorites = async (
  userId: string,
  options: { name?: string; page?: number; limit?: number } = {},
): Promise<PaginationResult<IFile>> => {
  const { name, page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = {
    userId,
    isFavorite: true,
    isPrivate: false,
  };

  if (name) {
    query.name = { $regex: name, $options: "i" };
  }

  const [files, total] = await Promise.all([
    File.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    File.countDocuments(query),
  ]);

  return { data: files, total, page, limit };
};

const togglePrivate = async (
  userId: string,
  fileId: string,
  privateFolderId?: string,
  targetFolderId?: string,
): Promise<IFile> => {
  const file = await File.findOne({ _id: fileId, userId });
  if (!file) {
    throw new AppError(httpStatus.NOT_FOUND, "File not found");
  }

  if (file.isPrivate) {
    if (!targetFolderId) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "targetFolderId is required to make the file public",
      );
    }

    const targetFolder = await Folder.findOne({
      _id: targetFolderId,
      userId,
      isPrivate: false,
    });
    if (!targetFolder) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        "Target folder not found or is private",
      );
    }

    await Promise.all([
      Folder.findByIdAndUpdate(file.folderId, {
        $inc: { storageUsed: -file.size },
      }),
      Folder.findByIdAndUpdate(targetFolderId, {
        $inc: { storageUsed: file.size },
      }),
    ]);

    file.folderId = targetFolder._id;
    file.isPrivate = false;
  } else {
    const privateFolder = privateFolderId
      ? await Folder.findOne({ _id: privateFolderId, userId, isPrivate: true })
      : await Folder.findOne({ userId, isPrivate: true });

    if (!privateFolder) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        "Private folder not found. Create one first.",
      );
    }

    file.shareToken = undefined;
    file.shareTokenExpiry = undefined;

    await Promise.all([
      Folder.findByIdAndUpdate(file.folderId, {
        $inc: { storageUsed: -file.size },
      }),
      Folder.findByIdAndUpdate(privateFolder._id, {
        $inc: { storageUsed: file.size },
      }),
    ]);

    file.folderId = privateFolder._id;
    file.isPrivate = true;
  }

  await file.save();
  return file;
};

const searchFiles = async (
  userId: string,
  options: FileSearchOptions,
): Promise<PaginationResult<IFile>> => {
  const { name, type, startDate, endDate, page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = { userId, isPrivate: false };

  if (name) {
    query.name = { $regex: name, $options: "i" };
  }

  if (type) {
    query.type = type;
  }

  if (startDate || endDate) {
    const dateFilter: Record<string, Date> = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.$lte = new Date(endDate);
    }
    query.createdAt = dateFilter;
  }

  const [files, total] = await Promise.all([
    File.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    File.countDocuments(query),
  ]);

  return { data: files, total, page, limit };
};

export const FileService = {
  uploadFile,
  getFilesByFolder,
  getFileById,
  renameFile,
  copyFile,
  duplicateFile,
  deleteFile,
  shareFile,
  getSharedFile,
  toggleFavorite,
  getFavorites,
  togglePrivate,
  searchFiles,
};
