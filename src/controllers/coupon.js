import { Router } from "express";
import { catchAsync } from "../middlewares/catchAsync";
import { NotFoundResponse, BadResponse } from "../lib/error";
import { isShop } from "../middlewares/auth";
import { CouponModel } from "../models/coupon";

const router = Router();

// GET routes
router.get(
  "/seller/:id",
  isShop,
  catchAsync(async (request, response) => {
    const coupons = await CouponModel.find({
      shopId: request.seller._id,
    }).sort({ updatedAt: -1, createdAt: -1 });

    if (!coupons.length) {
      throw new NotFoundResponse("No coupons found");
    }

    return response.success(
      {
        data: { coupons },
      },
      {
        message: "Coupons retrieved successfully",
      }
    );
  })
);

router.get(
  "/value/:name",
  catchAsync(async (request, response) => {
    const coupon = await CouponModel.findOne({
      name: request.params.name,
    });

    if (!coupon) {
      throw new NotFoundResponse("Coupon not found");
    }

    return response.success(
      {
        data: { coupon },
      },
      {
        message: "Coupon retrieved successfully",
      }
    );
  })
);

// POST routes
router.post(
  "/",
  isShop,
  catchAsync(async (request, response) => {
    const existingCoupon = await CouponModel.findOne({
      name: request.body.name,
    });

    if (existingCoupon) {
      throw new BadResponse("Coupon already exists");
    }

    const coupon = await CouponModel.create(request.body);

    return response.created(
      {
        data: { coupon },
      },
      {
        message: "Coupon created successfully",
      }
    );
  })
);

// DELETE routes
router.delete(
  "/:id",
  isShop,
  catchAsync(async (request, response) => {
    const coupon = await CouponModel.findByIdAndDelete(request.params.id);

    if (!coupon) {
      throw new NotFoundResponse("Coupon not found");
    }

    return response.success(
      {
        data: { coupon },
      },
      {
        message: "Coupon deleted successfully",
      }
    );
  })
);

export const couponRouter = router;
