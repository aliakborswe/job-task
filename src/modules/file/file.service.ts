import httpStatus from "http-status";
import AppError from "../../utils/AppError";
import { User } from "../user/user.model";
import { envVars } from "../../config/env";
import { Folder } from "../folder/folder.model";
import { IFile, PaginationResult } from "./file.interface";
import { copyLocalFile, deleteLocalFile } from "../../helpers/fileSystem";
import { getFileType } from "../../middlewares/upload";
import { File } from "./file.model";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// check user have available storage
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

export const FileService = {
  uploadFile,
  getFilesByFolder,
  getFileById,
  renameFile,
  copyFile,
};
