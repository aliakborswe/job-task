import dotenv from "dotenv";
dotenv.config();

interface EnvConfig {
  PORT: string;
  NODE_ENV: "development" | "production";
  DB_URL: string;
  BCRYPT_SALT_ROUNDS: string;
  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;
  JWT_RESET_EXPIRES_IN: string;
  SMTP_HOST: string;
  SMTP_PORT: string;
  SMTP_USER: string;
  SMTP_PASS: string;
  SMTP_FROM_NAME: string;
  SMTP_FROM_EMAIL: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CALLBACK_URL: string;
  EXPRESS_SESSION_SECRET: string;
  CLIENT_URL: string;
}

const loadEnvVariables = (): EnvConfig => {
  const requiredEnvVariables = [
    "PORT",
    "NODE_ENV",
    "DB_URL",
    "BCRYPT_SALT_ROUNDS",
    "JWT_ACCESS_SECRET",
    "JWT_ACCESS_EXPIRES_IN",
    "JWT_REFRESH_SECRET",
    "JWT_REFRESH_EXPIRES_IN",
    "JWT_RESET_EXPIRES_IN",
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    "SMTP_FROM_NAME",
    "SMTP_FROM_EMAIL",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CALLBACK_URL",
    "EXPRESS_SESSION_SECRET",
    "CLIENT_URL",
  ];

  requiredEnvVariables.forEach((variable) => {
    if (!process.env[variable]) {
      throw new Error(`Missing required environment variable: ${variable}`);
    }
  });

  return {
    PORT: process.env.PORT as string,
    NODE_ENV: process.env.NODE_ENV as "development" | "production",
    DB_URL: process.env.DB_URL!,
    BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS as string,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
    JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN as string,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN as string,
    JWT_RESET_EXPIRES_IN: process.env.JWT_RESET_EXPIRES_IN as string,
    SMTP_HOST: process.env.SMTP_HOST as string,
    SMTP_PORT: process.env.SMTP_PORT as string,
    SMTP_USER: process.env.SMTP_USER as string,
    SMTP_PASS: process.env.SMTP_PASS as string,
    SMTP_FROM_NAME: process.env.SMTP_FROM_NAME as string,
    SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL as string,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL as string,
    EXPRESS_SESSION_SECRET: process.env.EXPRESS_SESSION_SECRET as string,
    CLIENT_URL: process.env.CLIENT_URL as string,
  };
};

export const envVars = loadEnvVariables();
