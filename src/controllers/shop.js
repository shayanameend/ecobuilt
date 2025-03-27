import { Router } from "express";
import { catchAsync } from "../middlewares/catchAsync";
import { BadResponse, NotFoundResponse } from "../lib/error";
import { isAuthorized, isAuthenticated, isSeller } from "../middlewares/auth";
import { ShopModel } from "../models/shop";
import { handleImageUpload, handleImageDelete } from "../utils/image";
import { sendEmail } from "../utils/mail";
import { sendShopToken } from "../utils/jwt";
import jwt from "jsonwebtoken";
import { env } from "../lib/env";

const router = Router();

// POST routes
router.post(
  "/",
  catchAsync(async (request, response) => {
    const { email } = request.body;

    const existingShop = await ShopModel.findOne({ email });
    if (existingShop) {
      throw new BadResponse("Shop already exists");
    }

    const avatar = await handleImageUpload(request.body.avatar, "SHOPS");

    const shopData = {
      name: request.body.name,
      email,
      password: request.body.password,
      avatar,
      address: request.body.address,
      phoneNumber: request.body.phoneNumber,
      zipCode: request.body.zipCode,
    };

    const activationToken = jwt.sign(shopData, env.EMAIL_VERIFICATION_SECRET, {
      expiresIn: "5m",
    });

    const activationUrl = `${env.CLIENT_URL}/shop/activation/${activationToken}`;

    await sendEmail({
      email: shopData.email,
      subject: "Activate your Shop",
      message: `Hello ${shopData.name}, please click on the link to activate your shop: ${activationUrl}`,
    });

    return response.created(
      {},
      {
        message: `Please check your email: ${shopData.email} to activate your shop!`,
      }
    );
  })
);

router.post(
  "/activation",
  catchAsync(async (request, response) => {
    const { activation_token } = request.body;

    const decoded = jwt.verify(activation_token, env.EMAIL_VERIFICATION_SECRET);
    if (!decoded) {
      throw new BadResponse("Invalid token");
    }

    const { name, email, password, avatar, zipCode, address, phoneNumber } =
      decoded;

    const existingShop = await ShopModel.findOne({ email });
    if (existingShop) {
      throw new BadResponse("Shop already exists");
    }

    const shop = await ShopModel.create({
      name,
      email,
      avatar,
      password,
      zipCode,
      address,
      phoneNumber,
    });

    return sendShopToken(shop, response);
  })
);

router.post(
  "/login",
  catchAsync(async (request, response) => {
    const { email, password } = request.body;

    if (!email || !password) {
      throw new BadResponse("Email and password are required");
    }

    const shop = await ShopModel.findOne({ email }).select("+password");
    if (!shop) {
      throw new NotFoundResponse("Shop not found");
    }

    const isPasswordValid = await shop.comparePassword(password);
    if (!isPasswordValid) {
      throw new BadResponse("Invalid credentials");
    }

    return sendShopToken(shop, response);
  })
);

// GET routes
router.get(
  "/me",
  isSeller,
  catchAsync(async (request, response) => {
    const shop = await ShopModel.findById(request.seller._id);
    if (!shop) {
      throw new NotFoundResponse("Shop not found");
    }

    return response.success(
      { data: { shop } },
      { message: "Shop retrieved successfully" }
    );
  })
);

router.get(
  "/logout",
  catchAsync(async (_request, response) => {
    response.cookie("seller_token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    return response.success({}, { message: "Logged out successfully" });
  })
);

router.get(
  "/:id",
  catchAsync(async (request, response) => {
    const shop = await ShopModel.findById(request.params.id);
    if (!shop) {
      throw new NotFoundResponse("Shop not found");
    }

    return response.success(
      { data: { shop } },
      { message: "Shop retrieved successfully" }
    );
  })
);

// PUT routes
router.put(
  "/avatar",
  isSeller,
  catchAsync(async (request, response) => {
    const shop = await ShopModel.findById(request.seller._id);

    if (request.body.avatar) {
      if (shop.avatar?.public_id) {
        await handleImageDelete([shop.avatar.public_id]);
      }

      const avatar = await handleImageUpload(request.body.avatar, "SHOPS", {
        width: 150,
      });

      shop.avatar = avatar;
      await shop.save();
    }

    return response.success(
      { data: { shop } },
      { message: "Avatar updated successfully" }
    );
  })
);

router.put(
  "/info",
  isSeller,
  catchAsync(async (request, response) => {
    const { name, description, address, phoneNumber, zipCode } = request.body;

    const shop = await ShopModel.findById(request.seller._id);
    if (!shop) {
      throw new NotFoundResponse("Shop not found");
    }

    shop.name = name;
    shop.description = description;
    shop.address = address;
    shop.phoneNumber = phoneNumber;
    shop.zipCode = zipCode;

    await shop.save();

    return response.success(
      { data: { shop } },
      { message: "Shop information updated successfully" }
    );
  })
);

router.put(
  "/withdraw-method",
  isSeller,
  catchAsync(async (request, response) => {
    const shop = await ShopModel.findByIdAndUpdate(
      request.seller._id,
      { withdrawMethod: request.body.withdrawMethod },
      { new: true }
    );

    return response.success(
      { data: { shop } },
      { message: "Withdraw method updated successfully" }
    );
  })
);

// DELETE routes
router.delete(
  "/withdraw-method",
  isSeller,
  catchAsync(async (request, response) => {
    const shop = await ShopModel.findById(request.seller._id);
    if (!shop) {
      throw new NotFoundResponse("Shop not found");
    }

    shop.withdrawMethod = null;
    await shop.save();

    return response.success(
      { data: { shop } },
      { message: "Withdraw method deleted successfully" }
    );
  })
);

// Admin routes
router.get(
  "/admin/all",
  isAuthenticated,
  isAuthorized("Admin"),
  catchAsync(async (_request, response) => {
    const shops = await ShopModel.find().sort({
      createdAt: -1,
    });

    return response.success(
      { data: { shops } },
      { message: "Shops retrieved successfully" }
    );
  })
);

router.delete(
  "/admin/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  catchAsync(async (request, response) => {
    const shop = await ShopModel.findById(request.params.id);
    if (!shop) {
      throw new NotFoundResponse("Shop not found");
    }

    await ShopModel.findByIdAndDelete(request.params.id);

    return response.success(
      { data: { shopId: request.params.id } },
      { message: "Shop deleted successfully" }
    );
  })
);

export const shopRouter = router;
