import type { NextFunction, Request, Response } from "express";

import jwt from "jsonwebtoken";

import { ForbiddenResponse, UnauthorizedResponse } from "@/lib/error";
import { UserModel } from "@/models/user";
import { ShopModel } from "@/models/shop";
import { catchAsync } from "@/middlewares/catchAsync";
import { env } from "@/lib/env";

export const isUser = catchAsync(
  async (request: Request, _response: Response, next: NextFunction) => {
    const { auth_token } = request.cookies;

    if (!auth_token) {
      throw new UnauthorizedResponse("Invalid Token");
    }

    const decoded = jwt.verify(auth_token, env.JWT_SECRET_KEY);

    const user = await UserModel.findById((decoded as jwt.JwtPayload)._id);

    if (!user) {
      throw new UnauthorizedResponse("User Not Found");
    }

    request.user = user;

    next();
  }
);

export const isShop = catchAsync(
  async (request: Request, _response: Response, next: NextFunction) => {
    const { seller_token } = request.cookies;
    if (!seller_token) {
      throw new UnauthorizedResponse("Invalid Token");
    }

    const decoded = jwt.verify(seller_token, env.JWT_SECRET_KEY);

    const shop = await ShopModel.findById((decoded as jwt.JwtPayload)._id);

    if (!shop) {
      throw new UnauthorizedResponse("Shop Not Found");
    }

    request.shop = shop;

    next();
  }
);

export const isAuthorized = (...roles: string[]) => {
  return (request: Request, _response: Response, next: NextFunction) => {
    if (!roles.includes(request.user.role)) {
      throw new ForbiddenResponse(
        `${request.user.role} can not access this resources!`
      );
    }

    next();
  };
};
