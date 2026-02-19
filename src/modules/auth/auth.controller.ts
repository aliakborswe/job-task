import httpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";
import { createUserTokens } from "../../utils/userTokens";
import { setAuthCookie } from "../../utils/setCookie";

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("body from controller", req.body);

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

export const AuthController = {
  createUser,
};
