import httpStatus from "http-status";
import { IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import { IAuthProvider } from "../user/user.interface";
import AppError from "../../utils/AppError";
import { hashPassword } from "../../helpers/hash";

// create a new user
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

export const AuthService = {
  createUser,
};
