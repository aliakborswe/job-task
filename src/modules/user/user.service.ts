import httpStatus from "http-status";
import AppError from "../../utils/AppError";
import { IUser } from "./user.interface";
import { User } from "./user.model";
import {
  comparePassword,
  comparePin,
  hashPassword,
  hashPin,
} from "../../helpers/hash";
import { deleteLocalFile } from "../../helpers/fileSystem";
import { File } from "../file/file.model";
import { Folder } from "../folder/folder.model";
import { envVars } from "../../config/env";

const MAX_PIN_ATTEMPTS = 5;

const PIN_LOCKOUT_DURATION_MS = 30 * 60 * 1000;

const getProfile = async (userId: string): Promise<IUser> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  return user;
};

const changeUserName = async (userId: string, name: string): Promise<IUser> => {
  const user = await User.findByIdAndUpdate(
    userId,
    { name },
    { new: true, runValidators: true },
  );
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  return user;
};

const changePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string,
): Promise<void> => {
  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (!user.password) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This account uses Google login. You cannot change password.",
    );
  }

  const isMatch = await comparePassword(oldPassword, user.password);
  if (!isMatch) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Current password is incorrect",
    );
  }

  user.password = await hashPassword(newPassword);
  await user.save();
};

const uploadProfileImage = async (
  userId: string,
  imagePath: string,
): Promise<IUser> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.profileImage) {
    deleteLocalFile(user.profileImage);
  }

  user.profileImage = imagePath;
  await user.save();
  return user;
};

const deleteAccount = async (userId: string): Promise<void> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const files = await File.find({ userId });
  for (const file of files) {
    deleteLocalFile(file.path);
  }

  await File.deleteMany({ userId });
  await Folder.deleteMany({ userId });

  if (user.profileImage) {
    deleteLocalFile(user.profileImage);
  }

  await User.findByIdAndDelete(userId);
};

const getStorage = async (
  userId: string,
): Promise<{
  used: number;
  total: number;
  remaining: number;
  usedPercentage: number;
}> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const total = parseInt(envVars.MAX_STORAGE_BYTES);
  const used = user.storageUsed;
  const remaining = Math.max(0, total - used);
  const usedPercentage = parseFloat(((used / total) * 100).toFixed(2));

  return { used, total, remaining, usedPercentage };
};

const setPin = async (userId: string, pin: string): Promise<void> => {
  const user = await User.findById(userId).select("+privatePin");
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  user.privatePin = await hashPin(pin);
  user.pinFailedAttempts = 0;
  user.pinLockedUntil = undefined;
  await user.save();
};

const verifyPin = async (userId: string, pin: string): Promise<boolean> => {
  const user = await User.findById(userId).select("+privatePin");
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (!user.privatePin) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "No PIN has been set. Please set a PIN first.",
    );
  }

  if (user.pinLockedUntil && user.pinLockedUntil > new Date()) {
    const remainingMs = user.pinLockedUntil.getTime() - Date.now();
    const remainingMin = Math.ceil(remainingMs / 60000);
    throw new AppError(
      httpStatus.TOO_MANY_REQUESTS,
      `PIN verification locked. Try again in ${remainingMin} minutes.`,
    );
  }

  const isValid = await comparePin(pin, user.privatePin);

  if (!isValid) {
    user.pinFailedAttempts += 1;

    if (user.pinFailedAttempts >= MAX_PIN_ATTEMPTS) {
      user.pinLockedUntil = new Date(Date.now() + PIN_LOCKOUT_DURATION_MS);
      await user.save();
      throw new AppError(
        httpStatus.TOO_MANY_REQUESTS,
        "Too many failed PIN attempts. Account locked for 30 minutes.",
      );
    }

    await user.save();
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      `Invalid PIN. ${MAX_PIN_ATTEMPTS - user.pinFailedAttempts} attempts remaining.`,
    );
  }

  if (user.pinFailedAttempts > 0) {
    user.pinFailedAttempts = 0;
    user.pinLockedUntil = undefined;
    await user.save();
  }

  return true;
};

export const UserService = {
  getProfile,
  changeUserName,
  changePassword,
  uploadProfileImage,
  deleteAccount,
  getStorage,
  setPin,
  verifyPin,
};
