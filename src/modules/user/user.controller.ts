import httpStatus from "http-status";
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { UserService } from "./user.service";
import AppError from "../../utils/AppError";

const getProfile = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.user as { userId: string };
    const user = await UserService.getProfile(userId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Profile retrieved successfully",
      data: user,
    });
  },
);

const changeUserName = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.user as { userId: string };
    const { name } = req.body;
    const user = await UserService.changeUserName(userId, name);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User Name updated successfully",
      data: user,
    });
  },
);

const changePassword = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.user as { userId: string };
    const { oldPassword, newPassword } = req.body;
    await UserService.changePassword(userId, oldPassword, newPassword);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Password changed successfully",
    });
  },
);

const uploadProfileImage = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.user as { userId: string };

    if (!req.file) {
      throw new AppError(httpStatus.BAD_REQUEST, "No image file provided");
    }

    const user = await UserService.uploadProfileImage(userId, req.file.path);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Profile image updated successfully",
      data: user,
    });
  },
);

const deleteAccount = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.user as { userId: string };
    await UserService.deleteAccount(userId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Account deleted successfully",
    });
  },
);

const getStorage = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.user as { userId: string };
    const quota = await UserService.getStorage(userId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Storage quota retrieved successfully",
      data: quota,
    });
  },
);

const setPin = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.user as { userId: string };
    const { pin } = req.body;
    await UserService.setPin(userId, pin);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "PIN set successfully",
    });
  },
);

const verifyPin = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.user as { userId: string };
    const { pin } = req.body;
    await UserService.verifyPin(userId, pin);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "PIN verified successfully",
      data: { verified: true },
    });
  },
);

// logout controller
const logout = catchAsync(async (_req: Request, res: Response) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Logout Successful",
    data: null,
  });
});

export const UserController = {
  getProfile,
  changeUserName,
  changePassword,
  uploadProfileImage,
  deleteAccount,
  getStorage,
  setPin,
  verifyPin,
  logout,
};
