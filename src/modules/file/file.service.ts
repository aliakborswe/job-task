import httpStatus from "http-status";
import AppError from "../../utils/AppError";
import { User } from "../user/user.model";
import { envVars } from "../../config/env";
import { Folder } from "../folder/folder.model";
import { IFile, PaginationResult } from "./file.interface";
import { deleteLocalFile } from "../../helpers/fileSystem";
import { getFileType } from "../../middlewares/upload";
import { File } from "./file.model";
import path from "path";

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

export const FileService = {
  uploadFile,
  getFilesByFolder,
};
