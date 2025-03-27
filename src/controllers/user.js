import { Router } from "express";
import { catchAsync } from "../middlewares/catchAsync";
import { BadResponse, NotFoundResponse } from "../lib/error";
import { isAuthorized, isAuthenticated } from "../middlewares/auth";
import { UserModel } from "../models/user";
import { handleImageUpload, handleImageDelete } from "../utils/image";
import { sendEmail } from "../utils/mail";
import { sendUserToken } from "../utils/jwt";
import jwt from "jsonwebtoken";
import { env } from "../lib/env";

const router = Router();

// POST routes
router.post(
  "/",
  catchAsync(async (request, response) => {
    const { name, email, password, avatar } = request.body;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      throw new BadResponse("User already exists");
    }

    const avatarImage = await handleImageUpload(avatar, "AVATARS");

    const userData = {
      name,
      email,
      password,
      avatar: avatarImage,
    };

    const activationToken = jwt.sign(userData, env.EMAIL_VERIFICATION_SECRET, {
      expiresIn: "5m",
    });

    const activationUrl = `${env.CLIENT_URL}/activation/${activationToken}`;

    await sendEmail({
      email: userData.email,
      subject: "Activate your account",
      message: `Hello ${userData.name}, please click on the link to activate your account: ${activationUrl}`,
    });

    return response.created(
      {},
      {
        message: `Please check your email: ${userData.email} to activate your account!`,
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

    const { name, email, password, avatar } = decoded;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      throw new BadResponse("User already exists");
    }

    const user = await UserModel.create({
      name,
      email,
      password,
      avatar,
    });

    return sendUserToken(user, response);
  })
);

router.post(
  "/login",
  catchAsync(async (request, response) => {
    const { email, password } = request.body;

    if (!email || !password) {
      throw new BadResponse("Email and password are required");
    }

    const user = await UserModel.findOne({ email }).select("+password");
    if (!user) {
      throw new NotFoundResponse("User not found");
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new BadResponse("Invalid credentials");
    }

    return sendUserToken(user, response);
  })
);

// GET routes
router.get(
  "/me",
  isAuthenticated,
  catchAsync(async (request, response) => {
    const user = await UserModel.findById(request.user.id);
    if (!user) {
      throw new NotFoundResponse("User not found");
    }

    return response.success(
      { data: { user } },
      { message: "User retrieved successfully" }
    );
  })
);

router.get(
  "/logout",
  catchAsync(async (_request, response) => {
    response.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    return response.success({}, { message: "Logged out successfully" });
  })
);

// PUT routes
router.put(
  "/info",
  isAuthenticated,
  catchAsync(async (request, response) => {
    const { email, password, phoneNumber, name } = request.body;

    const user = await UserModel.findOne({ email }).select("+password");
    if (!user) {
      throw new NotFoundResponse("User not found");
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new BadResponse("Invalid credentials");
    }

    user.name = name;
    user.email = email;
    user.phoneNumber = phoneNumber;

    await user.save();

    return response.success(
      { data: { user } },
      { message: "User information updated successfully" }
    );
  })
);

router.put(
  "/avatar",
  isAuthenticated,
  catchAsync(async (request, response) => {
    const user = await UserModel.findById(request.user.id);

    if (request.body.avatar) {
      if (user.avatar?.public_id) {
        await handleImageDelete([user.avatar.public_id]);
      }

      const avatar = await handleImageUpload(request.body.avatar, "AVATARS", {
        width: 150,
      });

      user.avatar = avatar;
      await user.save();
    }

    return response.success(
      { data: { user } },
      { message: "Avatar updated successfully" }
    );
  })
);

// Admin routes
router.get(
  "/admin/all",
  isAuthenticated,
  isAuthorized("Admin"),
  catchAsync(async (_request, response) => {
    const users = await UserModel.find().sort({
      createdAt: -1,
    });

    return response.success(
      { data: { users } },
      { message: "Users retrieved successfully" }
    );
  })
);

router.delete(
  "/admin/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  catchAsync(async (request, response) => {
    const user = await UserModel.findById(request.params.id);
    if (!user) {
      throw new NotFoundResponse("User not found");
    }

    if (user.avatar?.public_id) {
      await handleImageDelete([user.avatar.public_id]);
    }

    await UserModel.findByIdAndDelete(request.params.id);

    return response.success(
      { data: { userId: request.params.id } },
      { message: "User deleted successfully" }
    );
  })
);

export const userRouter = router;
