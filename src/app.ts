import httpStatus from "http-status";
import cors from "cors";
import express, { Request, Response } from "express";
import expressSession from "express-session";
import { envVars } from "./config/env";
import cookieParser from "cookie-parser";
import { router } from "./routes";
import notFound from "./middlewares/notFound";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";

const app = express();

app.use(
  expressSession({
    secret: envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);

app.use(cookieParser());
app.use(express.json());
app.use(cors());

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    message: "Welcome to Store Management System Backend",
  });
});

app.get("/health", (req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    message: "Server is healthy",
  });
});

app.use(notFound);
app.use(globalErrorHandler);

export default app;
