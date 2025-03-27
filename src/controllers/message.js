import { Router } from "express";
import { catchAsync } from "@/middlewares/catchAsync";
import { NotFoundResponse, BadRequestResponse } from "@/lib/error";
import { isAuthenticated } from "@/middlewares/auth";
import { MessageModel } from "@/models/message";
import { cloudinary } from "@/utils/cloudinary";

const router = Router();

// GET routes
router.get(
  "/conversation/:conversationId",
  isAuthenticated,
  catchAsync(async (request, response) => {
    const messages = await MessageModel.find({
      conversationId: request.params.conversationId,
    }).sort({ createdAt: -1 });

    if (!messages.length) {
      throw new NotFoundResponse("No messages found for this conversation");
    }

    return response.success(
      { data: { messages } },
      { message: "Messages retrieved successfully" }
    );
  })
);

// POST routes
router.post(
  "/",
  isAuthenticated,
  catchAsync(async (request, response) => {
    const { conversationId, text, sender } = request.body;

    if (!conversationId || !sender) {
      throw new BadRequestResponse("Missing required fields");
    }

    const messageData = {
      conversationId,
      text,
      sender,
    };

    if (request.body.images) {
      const uploadResult = await cloudinary.v2.uploader.upload(
        request.body.images,
        { folder: "messages" }
      );

      messageData.images = {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
      };
    }

    const message = await MessageModel.create(messageData);

    return response.created(
      { data: { message } },
      { message: "Message sent successfully" }
    );
  })
);

export const messageRouter = router;
