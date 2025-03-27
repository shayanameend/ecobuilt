import { Router } from "express";
import { catchAsync } from "../middlewares/catchAsync";
import { isSeller, isAuthenticated } from "../middlewares/auth";
import { ConversationModel } from "../models/conversation";
import { NotFoundResponse } from "../lib/error";

const router = Router();

router.post(
  "/",
  catchAsync(async (request, response) => {
    const { groupTitle, userId, sellerId } = request.body;

    const isConversationExist = await ConversationModel.findOne({ groupTitle });

    if (isConversationExist) {
      return response.created(
        {
          data: {
            conversation: isConversationExist,
          },
        },
        {
          message: "Existing conversation retrieved",
        }
      );
    }

    const conversation = await ConversationModel.create({
      members: [userId, sellerId],
      groupTitle: groupTitle,
    });

    return response.created(
      {
        data: {
          conversation,
        },
      },
      {
        message: "New conversation created successfully",
      }
    );
  })
);

router.get(
  "/seller/:id",
  isSeller,
  catchAsync(async (request, response) => {
    const conversations = await ConversationModel.find({
      members: {
        $in: [request.params.id],
      },
    }).sort({ updatedAt: -1, createdAt: -1 });

    if (!conversations.length) {
      throw new NotFoundResponse("No conversations found for this seller");
    }

    return response.success(
      {
        data: {
          conversations,
        },
      },
      {
        message: "Seller conversations retrieved successfully",
      }
    );
  })
);

router.get(
  "/user/:id",
  isAuthenticated,
  catchAsync(async (request, response) => {
    const conversations = await ConversationModel.find({
      members: {
        $in: [request.params.id],
      },
    }).sort({ updatedAt: -1, createdAt: -1 });

    if (!conversations.length) {
      throw new NotFoundResponse("No conversations found for this user");
    }

    return response.success(
      {
        data: {
          conversations,
        },
      },
      {
        message: "User conversations retrieved successfully",
      }
    );
  })
);

router.put(
  "/:id/last-message",
  catchAsync(async (request, response) => {
    const { lastMessage, lastMessageId } = request.body;

    const conversation = await ConversationModel.findByIdAndUpdate(
      request.params.id,
      {
        lastMessage,
        lastMessageId,
      },
      { new: true }
    );

    if (!conversation) {
      throw new NotFoundResponse("Conversation not found");
    }

    return response.success(
      {
        data: {
          conversation,
        },
      },
      {
        message: "Last message updated successfully",
      }
    );
  })
);

export const conversationRouter = router;
