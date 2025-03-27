import { Router } from "express";
import { catchAsync } from "@/middlewares/catchAsync";
import {
  NotFoundResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} from "@/lib/error";
import { isAuthenticated } from "@/middlewares/auth";
import { UserModel } from "@/models/user";
import { cloudinary } from "@/utils/cloudinary";
import { sendMail } from "@/utils/sendMail";
import { createToken } from "@/utils/token";
import { env } from "@/lib/env";

const router = Router();

// GET routes
router.get(
  "/profile",
  isAuthenticated,
  catchAsync(async (request, response) => {
    const user = await UserModel.findById(request.user.id);

    if (!user) {
      throw new NotFoundResponse("User not found");
    }

    return response.success(
      { data: { user } },
      { message: "User profile retrieved successfully" }
    );
  })
);

router.get(
  "/logout",
  catchAsync(async (_request, response) => {
    response.cookie("token", "", {
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

// POST routes
router.post(
  "/",
  catchAsync(async (request, response) => {
    const { name, email, password, avatar } = request.body;

    if (!name || !email || !password) {
      throw new BadRequestResponse("Name, email and password are required");
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestResponse("User already exists with this email");
    }

    const avatarUpload = await cloudinary.v2.uploader.upload(avatar, {
      folder: "avatars",
    });

    const activationToken = createToken(
      {
        name,
        email,
        password,
        avatar: {
          public_id: avatarUpload.public_id,
          url: avatarUpload.secure_url,
        },
      },
      env.EMAIL_VERIFICATION_SECRET,
      "5m"
    );

    const activationUrl = `${env.CLIENT_URL}/activation/${activationToken}`;

    await sendMail({
      email,
      subject: "Activate your account",
      message: `Hello ${name}, please click on the link to activate your account: ${activationUrl}`,
    });

    return response.created(
      { data: { email } },
      { message: "Please check your email to activate your account" }
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

    const { name, email, password, avatar } = decodedData;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestResponse("User already exists with this email");
    }

    const user = await UserModel.create({
      name,
      email,
      password,
      avatar,
    });

    const authToken = createToken({ id: user._id }, env.JWT_SECRET_KEY, "7d");

    return response.created(
      {
        data: { user },
        token: authToken,
      },
      { message: "Account activated successfully" }
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

    const user = await UserModel.findOne({ email }).select("+password");
    if (!user) {
      throw new NotFoundResponse("User not found");
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedResponse("Invalid credentials");
    }

    const token = createToken({ id: user._id }, env.JWT_SECRET_KEY, "7d");

    return response.success(
      {
        data: { user },
        token,
      },
      { message: "Login successful" }
    );
  })
);

// PUT routes
router.put(
  "/profile",
  isAuthenticated,
  catchAsync(async (request, response) => {
    const { email, currentPassword, name, phoneNumber } = request.body;

    const user = await UserModel.findById(request.user.id).select("+password");
    if (!user) {
      throw new NotFoundResponse("User not found");
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedResponse("Invalid current password");
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.phoneNumber = phoneNumber || user.phoneNumber;

    await user.save();

    return response.success(
      { data: { user } },
      { message: "Profile updated successfully" }
    );
  })
);

router.put(
  "/avatar",
  isAuthenticated,
  catchAsync(async (request, response) => {
    const user = await UserModel.findById(request.user.id);
    if (!user) {
      throw new NotFoundResponse("User not found");
    }

    if (user.avatar?.public_id) {
      await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    }

    const avatarUpload = await cloudinary.v2.uploader.upload(
      request.body.avatar,
      {
        folder: "avatars",
        width: 150,
      }
    );

    user.avatar = {
      public_id: avatarUpload.public_id,
      url: avatarUpload.secure_url,
    };

    await user.save();

    return response.success(
      { data: { user } },
      { message: "Avatar updated successfully" }
    );
  })
);

router.put(
  "/addresses",
  isAuthenticated,
  catchAsync(async (request, response) => {
    const user = await UserModel.findById(request.user.id);
    if (!user) {
      throw new NotFoundResponse("User not found");
    }

    const sameTypeAddress = user.addresses.find(
      (address) => address.addressType === request.body.addressType
    );
    if (sameTypeAddress) {
      throw new BadRequestResponse(
        `${request.body.addressType} address already exists`
      );
    }

    const existingAddressIndex = user.addresses.findIndex(
      (address) => address._id.toString() === request.body._id
    );

    if (existingAddressIndex >= 0) {
      user.addresses[existingAddressIndex] = request.body;
    } else {
      user.addresses.push(request.body);
    }

    await user.save();

    return response.success(
      { data: { user } },
      { message: "Address updated successfully" }
    );
  })
);

export const userRouter = router;
