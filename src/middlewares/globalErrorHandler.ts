import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import AppError from "../utils/AppError";

export const globalErrorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR as number;
  let message = "Internal server error";
  let isOperational = false;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  if (err.name === "ValidationError") {
    statusCode = httpStatus.BAD_REQUEST as number;
    message = err.message;
    isOperational = true;
  }

  if (
    err.name === "MongoServerError" &&
    (err as unknown as Record<string, unknown>).code === 11000
  ) {
    statusCode = httpStatus.CONFLICT as number;
    message = "Duplicate entry. Resource already exists.";
    isOperational = true;
  }

  if (err.name === "CastError") {
    statusCode = httpStatus.BAD_REQUEST as number;
    message = "Invalid ID format";
    isOperational = true;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = httpStatus.UNAUTHORIZED as number;
    message = "Invalid token";
    isOperational = true;
  }

  if (err.name === "TokenExpiredError") {
    statusCode = httpStatus.UNAUTHORIZED as number;
    message = "Token has expired";
    isOperational = true;
  }

  if (err.name === "MulterError") {
    statusCode = httpStatus.BAD_REQUEST as number;
    message = err.message;
    isOperational = true;
  }

  const response: Record<string, unknown> = {
    success: false,
    message,
  };

  if (process.env.NODE_ENV === "development" && !isOperational) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
