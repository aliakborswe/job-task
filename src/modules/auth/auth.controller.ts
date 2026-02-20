import httpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";
import { createUserTokens } from "../../utils/userTokens";
import { setAuthCookie } from "../../utils/setCookie";
import AppError from "../../utils/AppError";
import { envVars } from "../../config/env";

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
    const accessToken = req.cookies.accessToken;

    await AuthService.resetPassword(newPassword, accessToken);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Password reset Successfully",
      data: null,
    });
  },
);

// get new access token with refresh token service
const getNewAccessToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "No refresh token received from cookies",
      );
    }

    const tokenInfo = await AuthService.getNewAccessToken(refreshToken);
    setAuthCookie(res, tokenInfo);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "New Access Token Retrieved Successful",
      data: tokenInfo,
    });
  },
);

// logout controller
const logout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
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
  },
);

const googleCallbackController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let redirectTo = req.query.state ? (req.query.state as string) : "";

    if (redirectTo.startsWith("/")) {
      redirectTo = redirectTo.slice(1);
    }
    const user = req.user;

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
    }

    const tokenInfo = createUserTokens(user);

    setAuthCookie(res, tokenInfo);

    res.redirect(`${envVars.CLIENT_URL}/${redirectTo}`);
  },
);

export const AuthController = {
  createUser,
  login,
  forgotPassword,
  resetPassword,
  getNewAccessToken,
  logout,
  googleCallbackController,
};
