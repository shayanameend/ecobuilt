import { Router } from "express";

import { BadResponse } from "@/lib/error";
import { catchAsync } from "@/middlewares/catchAsync";
import { env } from "@/lib/env";
import { isUser } from "@/middlewares/auth";

import Stripe from "stripe";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

const router = Router();

router.post(
  "/process",
  isUser,
  catchAsync(async (request, response) => {
    const { currency, amount } = request.body;

    if (!currency || !amount) {
      throw new BadResponse("Invalid Body");
    }

    if (amount <= 0) {
      throw new BadResponse("Invalid Amount");
    }

    const { id, client_secret } = await stripe.paymentIntents.create({
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
          paymentIntentId: id,
          clientSecret: client_secret,
        },
      },
      { message: "Payment Intent Created Successfully" }
    );
  })
);

router.post(
  "/confirm",
  isUser,
  catchAsync(async (request, response) => {
    const { paymentIntentId } = request.body;

    if (!paymentIntentId) {
      throw new BadResponse("Invalid Body");
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return response.success(
      // @ts-ignore
      { data: { paymentIntent } },
      { message: "Payment Intent Confirmed Successfully" }
    );
  })
);

export const paymentRouter = router;
