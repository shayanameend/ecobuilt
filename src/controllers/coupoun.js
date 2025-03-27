import { Router } from "express";
import { catchAsync } from "@/middlewares/catchAsync";
import { NotFoundResponse, BadRequestResponse } from "@/lib/error";
import { isSeller } from "@/middlewares/auth";
import { CoupounModel } from "@/models/coupoun";

const router = Router();

// GET routes
router.get(
  "/seller/:id",
  isSeller,
  catchAsync(async (request, response) => {
    const coupouns = await CoupounModel.find({
      shopId: request.seller.id,
    }).sort({ updatedAt: -1, createdAt: -1 });

    if (!coupouns.length) {
      throw new NotFoundResponse("No coupouns found");
    }

    return response.success(
      {
        data: { coupouns },
      },
      {
        message: "Coupouns retrieved successfully",
      }
    );
  })
);

router.get(
  "/value/:name",
  catchAsync(async (request, response) => {
    const coupoun = await CoupounModel.findOne({
      name: request.params.name,
    });

    if (!coupoun) {
      throw new NotFoundResponse("Coupoun not found");
    }

    return response.success(
      {
        data: { coupoun },
      },
      {
        message: "Coupoun retrieved successfully",
      }
    );
  })
);

// POST routes
router.post(
  "/",
  isSeller,
  catchAsync(async (request, response) => {
    const existingCoupoun = await CoupounModel.findOne({
      name: request.body.name,
    });

    if (existingCoupoun) {
      throw new BadRequestResponse("Coupoun already exists");
    }

    const coupoun = await CoupounModel.create(request.body);

    return response.created(
      {
        data: { coupoun },
      },
      {
        message: "Coupoun created successfully",
      }
    );
  })
);

// DELETE routes
router.delete(
  "/:id",
  isSeller,
  catchAsync(async (request, response) => {
    const coupoun = await CoupounModel.findByIdAndDelete(request.params.id);

    if (!coupoun) {
      throw new NotFoundResponse("Coupoun not found");
    }

    return response.success(
      {
        data: { coupoun },
      },
      {
        message: "Coupoun deleted successfully",
      }
    );
  })
);

export const coupounRouter = router;
