import { Router } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import { BadResponse, NotFoundResponse } from "@/lib/error";
import { catchAsync } from "@/middlewares/catchAsync";
import { env } from "@/lib/env";
import { handleImageUpload, handleImageDelete } from "@/utils/image";
import { isAuthorized, isAuthenticated } from "@/middlewares/auth";
import { removeUserToken, sendUserToken } from "@/utils/jwt";
import { sendEmail } from "@/utils/mail";
import { UserModel } from "@/models/user";

const router = Router();

router.post(
  "/",
  catchAsync(async (request, response) => {
    const { name, email, password, image } = request.body;

    if (!name || !email || !password || !image) {
      throw new BadResponse("Invalid Body");
    }

    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      throw new BadResponse("User Already Exists");
    }

    const userData = {
      name,
      email,
      password,
      image,
    };

    const verificationToken = jwt.sign(
      userData,
      env.EMAIL_VERIFICATION_SECRET,
      {
        expiresIn: "5m",
      }
    );

    const verificationUrl = `${env.CLIENT_URL}/verification/${verificationToken}`;

    await sendEmail({
      to: userData.email,
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

    const { name, email, password, image } = decoded as JwtPayload;

    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      throw new BadResponse("User already exists");
    }

    const uploadedImage = await handleImageUpload(image, "USERS");

    const user = await UserModel.create({
      name,
      email,
      password,
      image: uploadedImage,
    });

    // @ts-ignore
    return sendUserToken(user, response);
  })
);

router.post(
  "/login",
  catchAsync(async (request, response) => {
    const { email, password } = request.body;

    if (!email || !password) {
      throw new BadResponse("Invalid Body");
    }

    const user = await UserModel.findOne({ email }).select("+password");

    if (!user) {
      throw new NotFoundResponse("User Not Found");
    }

    // @ts-ignore
    const isPasswordValid = await user.compare(password);

    if (!isPasswordValid) {
      throw new BadResponse("Invalid Credentials");
    }

    // @ts-ignore
    return sendUserToken(user, response);
  })
);

router.get(
  "/me",
  isAuthenticated,
  catchAsync(async (request, response) => {
    const user = request.user;

    return response.success(
      // @ts-ignore
      { data: { user } },
      { message: "User Retrieved Successfully" }
    );
  })
);

router.get(
  "/logout",
  catchAsync(async (_request, response) => {
    return removeUserToken(response);
  })
);

router.put(
  "/info",
  isAuthenticated,
  catchAsync(async (request, response) => {
    const { name } = request.body;

    const user = request.user;

    user.name = name;

    // @ts-ignore
    await user.save();

    return response.success(
      // @ts-ignore
      { data: { user } },
      { message: "User Updated Successfully" }
    );
  })
);

router.put(
  "/image",
  isAuthenticated,
  catchAsync(async (request, response) => {
    const { image } = request.body;

    if (!image) {
      throw new BadResponse("Invalid Body");
    }

    const user = request.user;

    // @ts-ignore
    await handleImageDelete([user.image.public_id]);

    const uploadedImage = await handleImageUpload(image, "USERS");

    // @ts-ignore
    user.image = uploadedImage;

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
  isAuthenticated,
  isAuthorized("SUPER_ADMIN"),
  catchAsync(async (_request, response) => {
    const users = await UserModel.find().sort({
      createdAt: -1,
    });

    return response.success(
      // @ts-ignore
      { data: { users } },
      { message: "Users Retrieved Successfully" }
    );
  })
);

router.delete(
  "/admin/:id",
  isAuthenticated,
  isAuthorized("SUPER_ADMIN"),
  catchAsync(async (request, response) => {
    const { id } = request.params;

    if (!id) {
      throw new BadResponse("Invalid Params");
    }

    const user = request.user;

    // @ts-ignore
    await handleImageDelete([user.image.public_id]);

    await UserModel.findByIdAndDelete(id);

    return response.success(
      { data: {} },
      { message: "User Deleted Successfully" }
    );
  })
);

export const userRouter = router;
