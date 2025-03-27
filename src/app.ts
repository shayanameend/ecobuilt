import type { NextFunction, Request, Response } from "express";

import cors from "cors";
import express from "express";
import morgan from "morgan";

import { expandResponse } from "@/middlewares/response";
import { env } from "@/lib/env";

// Import all routers
import { userRouter } from "@/controllers/user";
import { shopRouter } from "@/controllers/shop";
import { productRouter } from "@/controllers/product";
import { eventRouter } from "@/controllers/event";
import { coupounRouter } from "@/controllers/coupoun";
import { paymentRouter } from "@/controllers/payment";
import { orderRouter } from "@/controllers/order";
import { messageRouter } from "@/controllers/message";
import { withdrawRouter } from "@/controllers/withdraw";

const app = express();

// Middleware
app.use(
  cors({
    origin: env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(expandResponse);

// API Routes
app.use("/api/users", userRouter);
app.use("/api/shops", shopRouter);
app.use("/api/products", productRouter);
app.use("/api/events", eventRouter);
app.use("/api/coupouns", coupounRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/orders", orderRouter);
app.use("/api/messages", messageRouter);
app.use("/api/withdraws", withdrawRouter);

// 404 Handler
app.all("*", (_request, response) => {
  response.notFound({}, { message: "Not Found" });
});

// Error Handler
app.use(
  (
    error: Error,
    _request: Request,
    response: Response,
    _next: NextFunction
  ) => {
    console.error(error);
    response.internalServerError({}, { message: "Internal Server Error" });
  }
);

export { app };
