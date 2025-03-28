import { Router } from "express";

import { BadResponse } from "@/lib/error";
import { catchAsync } from "@/middlewares/catchAsync";
import { handleImageUpload } from "@/utils/image";
import { isUser } from "@/middlewares/auth";
import { MessageModel } from "@/models/message";

const router = Router();

router.post(
  "/",
  isUser,
  catchAsync(async (request, response) => {
    const { conversationId, senderId, text, image } = request.body;

    if (!conversationId || !senderId || !text) {
      throw new BadResponse("Invalid Body");
    }

    const messageData = {
      conversationId,
      senderId,
      text,
    };

    if (image) {
      const uploadedImage = await handleImageUpload(image, "MESSAGES");

      Object.assign(messageData, { image: uploadedImage });
    }

    const message = await MessageModel.create(messageData);

    return response.created(
      // @ts-ignore
      { data: { message } },
      { message: "Message Sent Successfully" }
    );
  })
);

export const messageRouter = router;
