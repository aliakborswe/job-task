import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import AppError from "../utils/AppError";
import { verifyToken } from "../utils/jwt";
import { envVars } from "../config/env";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../modules/user/user.model";

export const checkAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const accessToken = req.cookies.accessToken || req.headers.authorization;

    if (!accessToken) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Authentication required. Please provide a valid token.",
      );
    }

    const verifiedToken = verifyToken(
      accessToken,
      envVars.JWT_ACCESS_SECRET,
    ) as JwtPayload;

    const isUserExist = await User.findOne({
      email: verifiedToken.email,
    });

    if (!isUserExist) {
      throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
    }
    if (isUserExist.isDeleted) {
      throw new AppError(httpStatus.BAD_REQUEST, "User is deleted");
    }
    req.user = verifiedToken;
    next();
  } catch (error) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid or expired token.");
  }
};
