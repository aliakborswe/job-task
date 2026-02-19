import bcrypt from "bcrypt";
import { envVars } from "../config/env";

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, parseInt(envVars.BCRYPT_SALT_ROUNDS));
};

export const comparePassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
