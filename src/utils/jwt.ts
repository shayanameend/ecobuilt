import type { Response } from "express";
import type { Document } from "mongoose";

interface UserDocument extends Document {
  getJwtToken(): string;
}

interface ShopDocument extends Document {
  getJwtToken(): string;
}

interface CookieOptions {
  expires: Date;
  httpOnly: boolean;
  sameSite: "none";
  secure: boolean;
}

const getCookieOptions = (): CookieOptions => ({
  expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
  httpOnly: true,
  sameSite: "none",
  secure: true,
});

export const sendUserToken = (user: UserDocument, response: Response): void => {
  const token = user.getJwtToken();
  const options = getCookieOptions();

  response.cookie("auth_token", token, options);

  return response.success(
    {
      data: { user: user.toObject({ getters: true, versionKey: false }) },
      token,
    },
    { message: "Login Successful" }
  );
};

export const removeUserToken = (response: Response): void => {
  const options = getCookieOptions();

  options.expires = new Date(Date.now() - 1000);

  response.cookie("auth_token", null, options);

  return response.success({}, { message: "Logout Successful" });
};

export const sendShopToken = (shop: ShopDocument, response: Response): void => {
  const token = shop.getJwtToken();
  const options = getCookieOptions();

  response.cookie("seller_token", token, options);

  return response.success(
    {
      data: { shop: shop.toObject({ getters: true, versionKey: false }) },
      token,
    },
    { message: "Login Successful" }
  );
};

export const removeShopToken = (response: Response): void => {
  const options = getCookieOptions();

  options.expires = new Date(Date.now() - 1000);

  response.cookie("seller_token", null, options);

  return response.success({}, { message: "Logout Successful" });
};
