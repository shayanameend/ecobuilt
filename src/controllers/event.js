import { Router } from "express";
import { catchAsync } from "../middlewares/catchAsync";
import { BadResponse, NotFoundResponse } from "../lib/error";
import { isAdmin, isAuthenticated, isSeller } from "../middlewares/auth";
import { EventModel } from "../models/event";
import { ShopModel } from "../models/shop";
import { handleImageUpload, handleImageDelete } from "../utils/image";

const router = Router();

// GET routes
router.get(
  "/",
  catchAsync(async (_request, response) => {
    const events = await EventModel.find().sort({
      updatedAt: -1,
      createdAt: -1,
    });

    if (!events.length) {
      throw new NotFoundResponse("No events found");
    }

    return response.success(
      { data: { events } },
      { message: "Events retrieved successfully" }
    );
  })
);

router.get(
  "/shop/:shopId",
  catchAsync(async (request, response) => {
    const events = await EventModel.find({
      shopId: request.params.shopId,
    }).sort({ updatedAt: -1, createdAt: -1 });

    if (!events.length) {
      throw new NotFoundResponse("No events found for this shop");
    }

    return response.success(
      { data: { events } },
      { message: "Shop events retrieved successfully" }
    );
  })
);

router.get(
  "/admin",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsync(async (_request, response) => {
    const events = await EventModel.find().sort({ createdAt: -1 });

    return response.success(
      { data: { events } },
      { message: "Admin events retrieved successfully" }
    );
  })
);

// POST routes
router.post(
  "/",
  isSeller,
  catchAsync(async (request, response) => {
    const shop = await ShopModel.findById(request.body.shopId);
    if (!shop) {
      throw new BadResponse("Shop not found");
    }

    const imagesLinks = await handleImageUpload(request.body.images, "EVENTS");

    const eventData = {
      ...request.body,
      images: imagesLinks,
      shop,
    };

    const event = await EventModel.create(eventData);

    return response.created(
      { data: { event } },
      { message: "Event created successfully" }
    );
  })
);

// DELETE routes
router.delete(
  "/:id",
  isSeller,
  catchAsync(async (request, response) => {
    const event = await EventModel.findById(request.params.id);
    if (!event) {
      throw new NotFoundResponse("Event not found");
    }

    const publicIds = event.images.map((image) => image.public_id);
    await handleImageDelete(publicIds);

    await EventModel.findByIdAndDelete(request.params.id);

    return response.success(
      { data: { eventId: request.params.id } },
      { message: "Event deleted successfully" }
    );
  })
);

export const eventRouter = router;
