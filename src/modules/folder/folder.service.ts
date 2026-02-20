import httpStatus from "http-status";
import AppError from "../../utils/AppError";
import { IFolder, PaginationResult } from "./folder.interface";
import { Folder } from "./folder.model";
import { User } from "../user/user.model";
import { hashPin } from "../../helpers/hash";

const createFolder = async (payload: Partial<IFolder>) => {
  const { name, userId } = payload;
  const folder = await Folder.create({ name, userId });
  return folder;
};

// get all folders service
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

//rename folder service
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

// create privet folder service
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

export const FolderService = {
  createFolder,
  getFolders,
  renameFolder,
  createPrivateFolder,
};
