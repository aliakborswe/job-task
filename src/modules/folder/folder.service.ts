import httpStatus from "http-status";
import AppError from "../../utils/AppError";
import { IFolder, PaginationResult } from "./folder.interface";
import { Folder } from "./folder.model";
import { User } from "../user/user.model";
import { hashPin } from "../../helpers/hash";
import { File } from "../file/file.model";
import { deleteLocalFile } from "../../helpers/fileSystem";

const createFolder = async (payload: Partial<IFolder>) => {
  const { name, userId } = payload;
  const folder = await Folder.create({ name, userId });
  return folder;
};

const getFolders = async (
  userId: string,
  options: { includePrivate?: boolean; page?: number; limit?: number } = {},
): Promise<PaginationResult<IFolder>> => {
  const { includePrivate = false, page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = { userId };
  if (!includePrivate) {
    query.isPrivate = false;
  }

  const [folders, total] = await Promise.all([
    Folder.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Folder.countDocuments(query),
  ]);

  return { data: folders, total, page, limit };
};

const renameFolder = async (
  userId: string,
  folderId: string,
  name: string,
): Promise<IFolder> => {
  const folder = await Folder.findOne({ _id: folderId, userId });
  if (!folder) {
    throw new AppError(httpStatus.NOT_FOUND, "Folder not found");
  }

  folder.name = name;
  await folder.save();
  return folder;
};

const createPrivateFolder = async (
  userId: string,
  name: string,
  pin: string,
): Promise<IFolder> => {
  const existing = await Folder.findOne({ userId, isPrivate: true });
  if (existing) {
    throw new AppError(
      httpStatus.CONFLICT,
      "Private folder already exists for this user",
    );
  }

  const user = await User.findById(userId).select("+privatePin");
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  user.privatePin = await hashPin(pin);
  user.pinFailedAttempts = 0;
  user.pinLockedUntil = undefined;
  await user.save();

  const folder = await Folder.create({
    name,
    userId,
    isPrivate: true,
  });

  return folder;
};
const getPrivateFolder = async (userId: string): Promise<IFolder | null> => {
  return Folder.findOne({ userId, isPrivate: true });
};

const getFolderById = async (
  userId: string,
  folderId: string,
): Promise<IFolder> => {
  const folder = await Folder.findOne({ _id: folderId, userId });
  if (!folder) {
    throw new AppError(httpStatus.NOT_FOUND, "Folder not found");
  }
  return folder;
};

const searchFolders = async (
  userId: string,
  name: string,
  page = 1,
  limit = 20,
): Promise<PaginationResult<IFolder>> => {
  const skip = (page - 1) * limit;
  const query = {
    userId,
    isPrivate: false,
    name: { $regex: name, $options: "i" },
  };

  const [folders, total] = await Promise.all([
    Folder.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Folder.countDocuments(query),
  ]);

  return { data: folders, total, page, limit };
};

const deleteFolder = async (
  userId: string,
  folderId: string,
): Promise<void> => {
  const folder = await Folder.findOne({ _id: folderId, userId });
  if (!folder) {
    throw new AppError(httpStatus.NOT_FOUND, "Folder not found");
  }

  const files = await File.find({ folderId: folder._id, userId });
  let totalSize = 0;

  for (const file of files) {
    deleteLocalFile(file.path);
    totalSize += file.size;
  }

  await File.deleteMany({ folderId: folder._id, userId });

  await User.findByIdAndUpdate(userId, {
    $inc: { storageUsed: -totalSize },
  });

  await Folder.findByIdAndDelete(folderId);
};

export const FolderService = {
  createFolder,
  getFolders,
  renameFolder,
  createPrivateFolder,
  getPrivateFolder,
  getFolderById,
  searchFolders,
  deleteFolder,
};
