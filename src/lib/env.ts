import "dotenv/config";

import * as zod from "zod";

const envSchema = zod.object({
  NODE_ENV: zod.enum(["development", "production"]).default("development"),
  PORT: zod.coerce.number(),
  DB_URL: zod.string().url(),
  JWT_SECRET_KEY: zod.string(),
  JWT_EXPIRES: zod.string(),
  APP_NAME: zod.string(),
  APP_SUPPORT_EMAIL: zod.string().email(),
  APP_ADMIN_EMAIL: zod.string().email(),
  EMAIL_VERIFICATION_SECRET: zod.string(),
  NODEMAILER_HOST: zod.string(),
  NODEMAILER_PORT: zod.coerce.number(),
  NODEMAILER_SECURE: zod.string(),
  NODEMAILER_EMAIL: zod.string().email(),
  NODEMAILER_PASSWORD: zod.string(),
  STRIPE_API_KEY: zod.string(),
  STRIPE_SECRET_KEY: zod.string(),
  CLOUDINARY_NAME: zod.string(),
  CLOUDINARY_API_KEY: zod.string(),
  CLOUDINARY_API_SECRET: zod.string(),
  CLIENT_URL: zod.string().url(),
  AWS_ACCESS_KEY_ID: zod.string(),
  AWS_SECRET_ACCESS_KEY: zod.string(),
  AWS_REGION: zod.string(),
});

export const env = envSchema.parse(process.env);
