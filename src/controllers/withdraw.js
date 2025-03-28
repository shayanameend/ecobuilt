import { Router } from "express";
import { catchAsync } from "../middlewares/catchAsync";
import { NotFoundResponse, BadResponse } from "../lib/error";
import { isShop, isUser, isAuthorized } from "../middlewares/auth";
import { WithdrawModel } from "../models/withdraw";
import { ShopModel } from "../models/shop";
import { sendEmail } from "../utils/mail";

const router = Router();

// GET routes
router.get(
  "/",
  isUser,
  isAuthorized("Admin"),
  catchAsync(async (_request, response) => {
    const withdraws = await WithdrawModel.find().sort({
      updatedAt: -1,
      createdAt: -1,
    });

    if (!withdraws.length) {
      throw new NotFoundResponse("No withdraw requests found");
    }

    return response.success(
      { data: { withdraws } },
      { message: "Withdraw requests retrieved successfully" }
    );
  })
);

// POST routes
router.post(
  "/",
  isShop,
  catchAsync(async (request, response) => {
    const { amount } = request.body;

    if (!amount || amount <= 0) {
      throw new BadResponse("Valid amount is required");
    }

    const shop = await ShopModel.findById(request.seller._id);
    if (!shop) {
      throw new NotFoundResponse("Shop not found");
    }

    if (shop.availableBalance < amount) {
      throw new BadResponse("Insufficient balance");
    }

    const withdraw = await WithdrawModel.create({
      seller: request.seller,
      amount,
      status: "pending",
    });

    shop.availableBalance -= amount;
    await shop.save();

    await sendEmail({
      email: request.seller.email,
      subject: "Withdraw Request Confirmation",
      message: `Hello ${request.seller.name}, Your withdraw request of $${amount} is being processed. Processing time is typically 3-7 business days.`,
    });

    return response.created(
      { data: { withdraw } },
      { message: "Withdraw request created successfully" }
    );
  })
);

// PUT routes
router.put(
  "/:id",
  isUser,
  isAuthorized("Admin"),
  catchAsync(async (request, response) => {
    const { sellerId } = request.body;

    if (!sellerId) {
      throw new BadResponse("Seller ID is required");
    }

    const withdraw = await WithdrawModel.findByIdAndUpdate(
      request.params.id,
      {
        status: "succeeded",
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!withdraw) {
      throw new NotFoundResponse("Withdraw request not found");
    }

    const seller = await ShopModel.findById(sellerId);
    if (!seller) {
      throw new NotFoundResponse("Seller not found");
    }

    const transaction = {
      _id: withdraw._id,
      amount: withdraw.amount,
      updatedAt: withdraw.updatedAt,
      status: withdraw.status,
    };

    seller.transactions = [...seller.transactions, transaction];
    await seller.save();

    await sendEmail({
      email: seller.email,
      subject: "Withdrawal Processed",
      message: `Hello ${seller.name}, Your withdrawal request of $${withdraw.amount} has been processed. The funds should arrive in your account within 3-7 business days.`,
    });

    return response.success(
      { data: { withdraw } },
      { message: "Withdraw request updated successfully" }
    );
  })
);

export const withdrawRouter = router;
