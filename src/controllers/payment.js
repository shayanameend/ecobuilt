import { Router } from "express";
import { catchAsync } from "../middlewares/catchAsync";
import { BadResponse } from "../lib/error";
import { isUser } from "../middlewares/auth";
import { env } from "../lib/env";

import Stripe from "stripe";

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

const router = Router();

// GET routes
router.get(
  "/stripe-key",
  isUser,
  catchAsync(async (_request, response) => {
    return response.success(
      { data: { apiKey: env.STRIPE_API_KEY } },
      { message: "Stripe API key retrieved successfully" }
    );
  })
);

// POST routes
router.post(
  "/process",
  isUser,
  catchAsync(async (request, response) => {
    const { amount, currency = "usd" } = request.body;

    if (!amount || amount <= 0) {
      throw new BadResponse("Valid amount is required");
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: {
        userId: request.user._id,
        timestamp: new Date().toISOString(),
      },
    });

    return response.success(
      {
        data: {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        },
      },
      { message: "Payment intent created successfully" }
    );
  })
);

router.post(
  "/confirm",
  isUser,
  catchAsync(async (request, response) => {
    const { paymentIntentId } = request.body;

    if (!paymentIntentId) {
      throw new BadResponse("Payment intent ID is required");
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return response.success(
      { data: { paymentIntent } },
      { message: "Payment status retrieved successfully" }
    );
  })
);

export const paymentRouter = router;
