import { Router } from "express";
import { catchAsync } from "../middlewares/catchAsync";
import { BadResponse } from "../lib/error";
import { isAuthenticated } from "../middlewares/auth";
import { MessageModel } from "../models/message";
import { handleImageUpload } from "../utils/image";

const router = Router();

router.post(
  "/",
  isAuthenticated,
  catchAsync(async (request, response) => {
    const { conversationId, text, sender, images } = request.body;

    if (!conversationId || !sender) {
      throw new BadResponse("Missing required fields");
    }

    const messageData = {
      conversationId,
      text,
      sender,
    };

    if (images) {
      messageData.images = await handleImageUpload(images, "MESSAGES");
    }

    const message = await MessageModel.create(messageData);

    return response.created(
      { data: { message } },
      { message: "Message sent successfully" }
    );
  })
);

export const messageRouter = router;
