import httpStatus from "http-status";
import { IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import { IAuthProvider } from "../user/user.interface";
import AppError from "../../utils/AppError";
import { comparePassword, hashPassword } from "../../helpers/hash";

// create user service
const createUser = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;

  console.log("payload from service", payload);

  const isUserExist = await User.findOne({ email });

  if (isUserExist) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "User already exists with this email",
    );
  }

  const hashedPassword = await hashPassword(password as string);

  const authProvider: IAuthProvider = {
    provider: "credentials",
    providerId: email as string,
  };

  const user = await User.create({
    email,
    password: hashedPassword,
    auths: [authProvider],
    ...rest,
  });

  return user;
};

// login service
const login = async (payload: Partial<IUser>) => {
  const { email, password } = payload;
  const user = await User.findOne({ email: email }).select("+password");
  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  if (!user.password) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "This account uses Google login. Please sign in with Google.",
    );
  }

  const isPasswordValid = await comparePassword(
    password as string,
    user.password,
  );
  if (!isPasswordValid) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  return user;
};

export const AuthService = {
  createUser,
  login,
};
