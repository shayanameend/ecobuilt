import type { NextFunction, Request, Response } from "express";

import jwt from "jsonwebtoken";

import { ForbiddenResponse, UnauthorizedResponse } from "@/lib/error";
import { UserModel } from "@/models/user";
import { ShopModel } from "@/models/shop";
import { catchAsync } from "@/middlewares/catchAsync";
import { env } from "@/lib/env";

export const isAuthenticated = catchAsync(
  async (request: Request, _response: Response, next: NextFunction) => {
    const { token } = request.cookies;

    if (!token) {
      throw new UnauthorizedResponse("Please login to continue");
    }

    const decoded = jwt.verify(token, env.JWT_SECRET_KEY);

    const user = await UserModel.findById((decoded as jwt.JwtPayload).id);

    if (!user) {
      throw new UnauthorizedResponse("User not found");
    }

    request.user = user;

    next();
  }
);

export const isSeller = catchAsync(
  async (request: Request, _response: Response, next: NextFunction) => {
    const { seller_token } = request.cookies;
    if (!seller_token) {
      throw new UnauthorizedResponse("Please login to continue");
    }

    const decoded = jwt.verify(seller_token, env.JWT_SECRET_KEY);

    const shop = await ShopModel.findById((decoded as jwt.JwtPayload).id);

    if (!shop) {
      throw new UnauthorizedResponse("Seller not found");
    }

    request.seller = shop;

    next();
  }
);

export const isAdmin = (...roles: string[]) => {
  return (request: Request, _response: Response, next: NextFunction) => {
    if (!roles.includes(request.user.role)) {
      throw new ForbiddenResponse(
        `${request.user.role} can not access this resources!`
      );
    }

    next();
  };
};
