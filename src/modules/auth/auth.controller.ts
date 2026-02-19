import httpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";
import { createUserTokens } from "../../utils/userTokens";
import { setAuthCookie } from "../../utils/setCookie";
import { generateToken } from "../../utils/jwt";
import { sendPasswordResetEmail } from "../../utils/sendEmail";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";

// create user controller
const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await AuthService.createUser(req.body);
    const tokens = createUserTokens(user);
    setAuthCookie(res, tokens);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "User created successfully",
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user,
      },
    });
  },
);

// login controller
const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await AuthService.login(req.body);

    const tokens = createUserTokens(user);

    setAuthCookie(res, tokens);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User logged in successfully",
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user,
      },
    });
  },
);

// forgot password controller
const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    const result = await AuthService.forgotPassword(email);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "If the email exists, a reset link has been sent.",
    });
  },
);

// reset password controller
const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newPassword = req.body.newPassword;
    const oldPassword = req.body.oldPassword;
    const accessToken = req.cookies["accessToken"]; 

    await AuthService.resetPassword(
      oldPassword,
      newPassword,
      accessToken as JwtPayload,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Password Changed Successfully",
      data: null,
    });
  },
);

export const AuthController = {
  createUser,
  login,
  forgotPassword,
  resetPassword,
};
