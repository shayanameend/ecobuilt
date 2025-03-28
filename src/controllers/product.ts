import { Router } from "express";

import { BadResponse, NotFoundResponse } from "@/lib/error";
import { catchAsync } from "@/middlewares/catchAsync";
import { handleImageUpload, handleImageDelete } from "@/utils/image";
import { isShop } from "@/middlewares/auth";
import { ProductModel } from "@/models/product";

const router = Router();

router.get(
  "/",
  catchAsync(async (_request, response) => {
    const products = await ProductModel.find().sort({
      createdAt: -1,
      updatedAt: -1,
    });

    return response.success(
      // @ts-ignore
      { data: { products } },
      { message: "Products Retrieved Successfully" }
    );
  })
);

router.get(
  "/shop/:shopId",
  catchAsync(async (request, response) => {
    const { shopId } = request.params;

    if (!shopId) {
      throw new BadResponse("Invalid Params");
    }

    const products = await ProductModel.find({
      shopId,
    }).sort({
      createdAt: -1,
      updatedAt: -1,
    });

    return response.success(
      // @ts-ignore
      { data: { products } },
      { message: "Products Retrieved Successfully" }
    );
  })
);

router.post(
  "/",
  isShop,
  catchAsync(async (request, response) => {
    const {
      name,
      description,
      categoryId,
      originalPrice,
      discountedPrice,
      stock,
      images,
    } = request.body;

    if (
      !categoryId ||
      !name ||
      !description ||
      !stock ||
      !originalPrice ||
      !discountedPrice ||
      !images
    ) {
      throw new BadResponse("Invalid Body");
    }

    const shop = request.shop;

    const uploadedImages = await handleImageUpload(images, "PRODUCTS");

    const product = await ProductModel.create({
      shopId: shop._id,
      categoryId,
      images: uploadedImages,
      name,
      description,
      originalPrice,
      discountedPrice,
      stock,
    });

    return response.created(
      // @ts-ignore
      { data: { product } },
      { message: "Product Created Successfully" }
    );
  })
);

router.delete(
  "/:id",
  isShop,
  catchAsync(async (request, response) => {
    const { id } = request.params;

    if (!id) {
      throw new BadResponse("Invalid Params");
    }

    const product = await ProductModel.findOne({
      _id: id,
      shopId: request.shop._id,
    });

    if (!product) {
      throw new NotFoundResponse("Product Not Found");
    }

    const publicIds = product.images.map((image) => image.public_id);

    await handleImageDelete(publicIds);

    await product.deleteOne();

    return response.success(
      { data: { id } },
      { message: "Product Deleted Successfully" }
    );
  })
);

export const productRouter = router;
