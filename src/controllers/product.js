import { Router } from "express";
import { catchAsync } from "@/middlewares/catchAsync";
import { NotFoundResponse, BadRequestResponse } from "@/lib/error";
import { isSeller, isAuthenticated, isAdmin } from "@/middlewares/auth";
import { ProductModel } from "@/models/product";
import { OrderModel } from "@/models/order";
import { ShopModel } from "@/models/shop";
import { cloudinary } from "@/utils/cloudinary";

const router = Router();

// GET routes
router.get(
  "/",
  catchAsync(async (_request, response) => {
    const products = await ProductModel.find().sort({
      updatedAt: -1,
      createdAt: -1,
    });

    if (!products.length) {
      throw new NotFoundResponse("No products found");
    }

    return response.success(
      { data: { products } },
      { message: "Products retrieved successfully" }
    );
  })
);

router.get(
  "/shop/:shopId",
  catchAsync(async (request, response) => {
    const products = await ProductModel.find({
      shopId: request.params.shopId,
    }).sort({ updatedAt: -1, createdAt: -1 });

    if (!products.length) {
      throw new NotFoundResponse("No products found for this shop");
    }

    return response.success(
      { data: { products } },
      { message: "Shop products retrieved successfully" }
    );
  })
);

router.get(
  "/admin",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsync(async (_request, response) => {
    const products = await ProductModel.find().sort({
      updatedAt: -1,
      createdAt: -1,
    });

    if (!products.length) {
      throw new NotFoundResponse("No products found");
    }

    return response.success(
      { data: { products } },
      { message: "Admin products retrieved successfully" }
    );
  })
);

// POST routes
router.post(
  "/",
  isSeller,
  catchAsync(async (request, response) => {
    const { shopId, images, ...productData } = request.body;

    if (!shopId || !images) {
      throw new BadRequestResponse("Shop ID and images are required");
    }

    const shop = await ShopModel.findById(shopId);
    if (!shop) {
      throw new NotFoundResponse("Shop not found");
    }

    const imagesArray = Array.isArray(images) ? images : [images];
    const imagesLinks = await Promise.all(
      imagesArray.map((image) =>
        cloudinary.v2.uploader
          .upload(image, { folder: "products" })
          .then((result) => ({
            public_id: result.public_id,
            url: result.secure_url,
          }))
      )
    );

    const product = await ProductModel.create({
      ...productData,
      images: imagesLinks,
      shop,
      shopId,
    });

    return response.created(
      { data: { product } },
      { message: "Product created successfully" }
    );
  })
);

// PUT routes
router.put(
  "/:productId/review",
  isAuthenticated,
  catchAsync(async (request, response) => {
    const { rating, comment, orderId } = request.body;
    const { productId } = request.params;

    if (!rating || !comment) {
      throw new BadRequestResponse("Rating and comment are required");
    }

    const product = await ProductModel.findById(productId);
    if (!product) {
      throw new NotFoundResponse("Product not found");
    }

    const review = {
      user: request.user,
      rating,
      comment,
      productId,
    };

    const existingReviewIndex = product.reviews.findIndex(
      (rev) => rev.user._id.toString() === request.user._id.toString()
    );

    if (existingReviewIndex >= 0) {
      product.reviews[existingReviewIndex] = review;
    } else {
      product.reviews.push(review);
    }

    const avgRating =
      product.reviews.reduce((acc, rev) => acc + rev.rating, 0) /
      product.reviews.length;
    product.ratings = avgRating;

    await product.save({ validateBeforeSave: false });

    await OrderModel.findByIdAndUpdate(
      orderId,
      { $set: { "cart.$[elem].isReviewed": true } },
      {
        arrayFilters: [{ "elem._id": productId }],
        new: true,
      }
    );

    return response.success(
      { data: { product } },
      { message: "Review added successfully" }
    );
  })
);

// DELETE routes
router.delete(
  "/:productId",
  isSeller,
  catchAsync(async (request, response) => {
    const product = await ProductModel.findById(request.params.productId);

    if (!product) {
      throw new NotFoundResponse("Product not found");
    }

    await Promise.all(
      product.images.map((image) =>
        cloudinary.v2.uploader.destroy(image.public_id)
      )
    );

    await product.deleteOne();

    return response.success(
      { data: { productId: request.params.productId } },
      { message: "Product deleted successfully" }
    );
  })
);

export const productRouter = router;
