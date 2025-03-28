import { Router } from "express";
import { catchAsync } from "../middlewares/catchAsync";
import { NotFoundResponse, BadResponse } from "../lib/error";
import { isUser, isShop, isAuthorized } from "../middlewares/auth";
import { OrderModel } from "../models/order";
import { ShopModel } from "../models/shop";
import { ProductModel } from "../models/product";

const router = Router();

// GET routes
router.get(
  "/user/:userId",
  isUser,
  catchAsync(async (request, response) => {
    const orders = await OrderModel.find({
      "user._id": request.params.userId,
    }).sort({ createdAt: -1 });

    if (!orders.length) {
      throw new NotFoundResponse("No orders found for this user");
    }

    return response.success(
      { data: { orders } },
      { message: "Orders retrieved successfully" }
    );
  })
);

router.get(
  "/seller/:shopId",
  isShop,
  catchAsync(async (request, response) => {
    const orders = await OrderModel.find({
      "cart.shopId": request.params.shopId,
    }).sort({ createdAt: -1 });

    if (!orders.length) {
      throw new NotFoundResponse("No orders found for this shop");
    }

    return response.success(
      { data: { orders } },
      { message: "Shop orders retrieved successfully" }
    );
  })
);

router.get(
  "/admin",
  isUser,
  isAuthorized("Admin"),
  catchAsync(async (_request, response) => {
    const orders = await OrderModel.find().sort({
      deliveredAt: -1,
      createdAt: -1,
    });

    if (!orders.length) {
      throw new NotFoundResponse("No orders found");
    }

    return response.success(
      { data: { orders } },
      { message: "All orders retrieved successfully" }
    );
  })
);

// POST routes
router.post(
  "/",
  isUser,
  catchAsync(async (request, response) => {
    const { cart, shippingAddress, user, totalPrice, paymentInfo } =
      request.body;

    if (
      !cart?.length ||
      !shippingAddress ||
      !user ||
      !totalPrice ||
      !paymentInfo
    ) {
      throw new BadResponse("Missing required order fields");
    }

    const shopItemsMap = new Map();
    cart.forEach((item) => {
      const shopId = item.shopId;
      if (!shopItemsMap.has(shopId)) {
        shopItemsMap.set(shopId, []);
      }
      shopItemsMap.get(shopId).push(item);
    });

    const orders = [];
    for (const [_shopId, items] of shopItemsMap) {
      const order = await OrderModel.create({
        cart: items,
        shippingAddress,
        user,
        totalPrice,
        paymentInfo,
      });
      orders.push(order);
    }

    return response.created(
      { data: { orders } },
      { message: "Orders created successfully" }
    );
  })
);

// PUT routes
router.put(
  "/:orderId/status",
  isShop,
  catchAsync(async (request, response) => {
    const { status } = request.body;
    if (!status) {
      throw new BadResponse("Status is required");
    }

    const order = await OrderModel.findById(request.params.orderId);
    if (!order) {
      throw new NotFoundResponse("Order not found");
    }

    if (status === "Transferred to delivery partner") {
      await Promise.all(
        order.cart.map(async (item) => {
          const product = await ProductModel.findById(item._id);
          if (!product) {
            throw new NotFoundResponse(`Product ${item._id} not found`);
          }

          product.stock -= item.qty;
          product.sold_out += item.qty;
          await product.save({ validateBeforeSave: false });
        })
      );
    }

    if (status === "Delivered") {
      order.deliveredAt = Date.now();
      order.paymentInfo.status = "Succeeded";
      const serviceCharge = order.totalPrice * 0.1;

      const seller = await ShopModel.findById(request.seller._id);
      if (!seller) {
        throw new NotFoundResponse("Seller not found");
      }

      seller.availableBalance = order.totalPrice - serviceCharge;
      await seller.save();
    }

    order.status = status;
    await order.save({ validateBeforeSave: false });

    return response.success(
      { data: { order } },
      { message: "Order status updated successfully" }
    );
  })
);

router.put(
  "/:orderId/refund-request",
  isUser,
  catchAsync(async (request, response) => {
    const order = await OrderModel.findById(request.params.orderId);
    if (!order) {
      throw new NotFoundResponse("Order not found");
    }

    order.status = request.body.status;
    await order.save({ validateBeforeSave: false });

    return response.success(
      { data: { order } },
      { message: "Refund requested successfully" }
    );
  })
);

router.put(
  "/:orderId/refund-success",
  isShop,
  catchAsync(async (request, response) => {
    const order = await OrderModel.findById(request.params.orderId);
    if (!order) {
      throw new NotFoundResponse("Order not found");
    }

    if (request.body.status === "Refund Success") {
      await Promise.all(
        order.cart.map(async (item) => {
          const product = await ProductModel.findById(item._id);
          if (!product) {
            throw new NotFoundResponse(`Product ${item._id} not found`);
          }

          product.stock += item.qty;
          product.sold_out -= item.qty;
          await product.save({ validateBeforeSave: false });
        })
      );
    }

    order.status = request.body.status;
    await order.save({ validateBeforeSave: false });

    return response.success(
      { data: { order } },
      { message: "Refund processed successfully" }
    );
  })
);

export const orderRouter = router;
