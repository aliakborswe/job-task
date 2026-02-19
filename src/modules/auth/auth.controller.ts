import httpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";
import { createUserTokens } from "../../utils/userTokens";
import { setAuthCookie } from "../../utils/setCookie";

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
    console.log("login info: ", req.body);
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

export const AuthController = {
  createUser,
  login,
};
