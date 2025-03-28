import { Router } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import { BadResponse, NotFoundResponse } from "@/lib/error";
import { catchAsync } from "@/middlewares/catchAsync";
import { env } from "@/lib/env";
import { handleImageUpload, handleImageDelete } from "@/utils/image";
import { isAuthorized, isUser, isShop } from "@/middlewares/auth";
import { removeShopToken, sendShopToken } from "@/utils/jwt";
import { sendEmail } from "@/utils/mail";
import { ShopModel } from "@/models/shop";

const router = Router();

router.post(
  "/",
  catchAsync(async (request, response) => {
    const { name, email, password, avatar } = request.body;

    if (!name || !email || !password || !avatar) {
      throw new BadResponse("Invalid Body");
    }

    const existingShop = await ShopModel.findOne({ email });

    if (existingShop) {
      throw new BadResponse("Shop Already Exists");
    }

    const shopData = {
      name,
      email,
      password,
      avatar,
    };

    const verificationToken = jwt.sign(
      shopData,
      env.EMAIL_VERIFICATION_SECRET,
      {
        expiresIn: "5m",
      }
    );

    const verificationUrl = `${env.CLIENT_URL}/verification/${verificationToken}`;

    await sendEmail({
      to: shopData.email,
      subject: "",
      text: verificationUrl,
    });

    return response.created(
      {},
      {
        message: "Sign Up Successful",
      }
    );
  })
);

router.post(
  "/verify",
  catchAsync(async (request, response) => {
    const { token } = request.body;

    if (!token) {
      throw new BadResponse("Invalid Body");
    }

    const decoded = jwt.verify(token, env.EMAIL_VERIFICATION_SECRET);

    if (!decoded) {
      throw new BadResponse("Invalid Token");
    }

    const { name, email, password, avatar } = decoded as JwtPayload;

    const existingShop = await ShopModel.findOne({ email });

    if (existingShop) {
      throw new BadResponse("Shop already exists");
    }

    const uploadedImage = await handleImageUpload(avatar, "SHOPS", {
      width: 150,
    });

    const shop = await ShopModel.create({
      name,
      email,
      avatar: uploadedImage,
      password,
    });

    // @ts-ignore
    return sendShopToken(shop, response);
  })
);

router.post(
  "/login",
  catchAsync(async (request, response) => {
    const { email, password } = request.body;

    if (!email || !password) {
      throw new BadResponse("Invalid Body");
    }

    const shop = await ShopModel.findOne({ email }).select("+password");

    if (!shop) {
      throw new NotFoundResponse("Shop Not Found");
    }

    // @ts-ignore
    const isPasswordValid = await shop.compare(password);

    if (!isPasswordValid) {
      throw new BadResponse("Invalid Credentials");
    }

    // @ts-ignore
    return sendShopToken(shop, response);
  })
);

router.get(
  "/me",
  isShop,
  catchAsync(async (request, response) => {
    const shop = request.shop;

    return response.success(
      // @ts-ignore
      { data: { shop } },
      { message: "Shop Retrieved Successfully" }
    );
  })
);

router.get(
  "/logout",
  catchAsync(async (_request, response) => {
    return removeShopToken(response);
  })
);

router.put(
  "/info",
  isShop,
  catchAsync(async (request, response) => {
    const { name } = request.body;

    const user = request.user;

    user.name = name;

    // @ts-ignore
    await user.save();

    return response.success(
      // @ts-ignore
      { data: { user } },
      { message: "Shop Updated Successfully" }
    );
  })
);

router.put(
  "/image",
  isShop,
  catchAsync(async (request, response) => {
    const { avatar } = request.body;

    if (!avatar) {
      throw new BadResponse("Invalid Body");
    }

    const user = request.user;

    // @ts-ignore
    await handleImageDelete([user.avatar.public_id]);

    const uploadedImage = await handleImageUpload(avatar, "SHOPS");

    // @ts-ignore
    user.avatar = uploadedImage;

    // @ts-ignore
    await user.save();

    return response.success(
      { data: { user } },
      { message: "Avatar Updated Successfully" }
    );
  })
);

router.get(
  "/admin/all",
  isUser,
  isAuthorized("SUPER_ADMIN"),
  catchAsync(async (_request, response) => {
    const users = await ShopModel.find().sort({
      createdAt: -1,
    });

    return response.success(
      // @ts-ignore
      { data: { users } },
      { message: "Shops Retrieved Successfully" }
    );
  })
);

router.delete(
  "/admin/:id",
  isUser,
  isAuthorized("SUPER_ADMIN"),
  catchAsync(async (request, response) => {
    const { id } = request.params;

    if (!id) {
      throw new BadResponse("Invalid Params");
    }

    const user = request.user;

    // @ts-ignore
    await handleImageDelete([user.avatar.public_id]);

    await ShopModel.findByIdAndDelete(id);

    return response.success(
      { data: {} },
      { message: "Shop Deleted Successfully" }
    );
  })
);

export const shopRouter = router;
