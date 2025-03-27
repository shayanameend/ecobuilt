import { Router } from "express";
import { catchAsync } from "@/middlewares/catchAsync";
import { BadRequestResponse, NotFoundResponse } from "@/lib/error";
import { isSeller } from "@/middlewares/auth";
import { ShopModel } from "@/models/shop";
import { handleImageUpload, handleImageDelete } from "@/utils/image";
import { createToken } from "@/lib/jwt";
import { env } from "@/lib/env";

const router = Router();

// GET routes
router.get(
  "/",
  catchAsync(async (_request, response) => {
    const shops = await ShopModel.find().sort({ updatedAt: -1, createdAt: -1 });

    if (!shops.length) {
      throw new NotFoundResponse("No shops found");
    }

    return response.success(
      { data: { shops } },
      { message: "Shops retrieved successfully" }
    );
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

router.get(
  "/seller/profile",
  isSeller,
  catchAsync(async (request, response) => {
    const shop = await ShopModel.findById(request.seller._id);

    if (!shop) {
      throw new NotFoundResponse("Shop not found");
    }

    return response.success(
      { data: { shop } },
      { message: "Shop profile retrieved successfully" }
    );
  })
);

// POST routes
router.post(
  "/",
  catchAsync(async (request, response) => {
    const { email, name, password, address, phoneNumber, zipCode, avatar } =
      request.body;

    if (!email || !name || !password) {
      throw new BadRequestResponse("Email, name and password are required");
    }

    const existingShop = await ShopModel.findOne({ email });
    if (existingShop) {
      throw new BadRequestResponse("Shop already exists with this email");
    }

    const avatarUpload = await handleImageUpload(avatar, "SHOPS");

    const activationToken = createToken(
      {
        email,
        name,
        password,
        address,
        phoneNumber,
        zipCode,
        avatar: avatarUpload,
      },
      env.EMAIL_VERIFICATION_SECRET,
      "5m"
    );

    const activationUrl = `${env.CLIENT_URL}/seller/activation/${activationToken}`;

    await sendMail({
      email,
      subject: "Activate your Shop",
      message: `Hello ${name}, please click on the link to activate your shop: ${activationUrl}`,
    });

    return response.created(
      { data: { email } },
      { message: "Please check your email to activate your shop" }
    );
  })
);

router.post(
  "/activation",
  catchAsync(async (request, response) => {
    const { token } = request.body;

    if (!token) {
      throw new BadRequestResponse("Activation token is required");
    }

    const decodedData = jwt.verify(token, env.EMAIL_VERIFICATION_SECRET);
    if (!decodedData) {
      throw new UnauthorizedResponse("Invalid activation token");
    }

    const { email, name, password, avatar, zipCode, address, phoneNumber } =
      decodedData;

    const existingShop = await ShopModel.findOne({ email });
    if (existingShop) {
      throw new BadRequestResponse("Shop already exists with this email");
    }

    const shop = await ShopModel.create({
      name,
      email,
      password,
      avatar,
      zipCode,
      address,
      phoneNumber,
    });

    const authToken = createToken({ id: shop._id }, env.JWT_SECRET_KEY, "7d");

    return response.created(
      {
        data: { shop },
        token: authToken,
      },
      { message: "Shop activated successfully" }
    );
  })
);

router.post(
  "/login",
  catchAsync(async (request, response) => {
    const { email, password } = request.body;

    if (!email || !password) {
      throw new BadRequestResponse("Email and password are required");
    }

    const shop = await ShopModel.findOne({ email }).select("+password");
    if (!shop) {
      throw new NotFoundResponse("Shop not found");
    }

    const isPasswordValid = await shop.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedResponse("Invalid credentials");
    }

    const token = createToken({ id: shop._id }, env.JWT_SECRET_KEY, "7d");

    return response.success(
      {
        data: { shop },
        token,
      },
      { message: "Login successful" }
    );
  })
);

// PUT routes
router.put(
  "/profile",
  isSeller,
  catchAsync(async (request, response) => {
    const { name, description, address, phoneNumber, zipCode } = request.body;

    const shop = await ShopModel.findByIdAndUpdate(
      request.seller._id,
      {
        $set: {
          name,
          description,
          address,
          phoneNumber,
          zipCode,
        },
      },
      { new: true }
    );

    if (!shop) {
      throw new NotFoundResponse("Shop not found");
    }

    return response.success(
      { data: { shop } },
      { message: "Shop profile updated successfully" }
    );
  })
);

router.put(
  "/avatar",
  isSeller,
  catchAsync(async (request, response) => {
    const shop = await ShopModel.findById(request.seller._id);
    if (!shop) {
      throw new NotFoundResponse("Shop not found");
    }

    if (shop.avatar?.public_id) {
      await handleImageDelete(shop.avatar.public_id);
    }

    const avatar = await handleImageUpload(request.body.avatar, "SHOPS", {
      width: 150,
      height: 150,
      crop: "fill",
    });

    shop.avatar = avatar;
    await shop.save();

    return response.success(
      { data: { shop } },
      { message: "Shop avatar updated successfully" }
    );
  })
);

// DELETE routes
router.delete(
  "/logout",
  isSeller,
  catchAsync(async (_request, response) => {
    response.cookie("seller_token", "", {
      expires: new Date(0),
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return response.success(
      { data: {} },
      { message: "Logged out successfully" }
    );
  })
);

export const shopRouter = router;
