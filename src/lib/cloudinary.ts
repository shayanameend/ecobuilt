import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse, UploadApiOptions } from "cloudinary";
import { env } from "@/lib/env";

// Validate Cloudinary configuration
if (
  !env.CLOUDINARY_NAME ||
  !env.CLOUDINARY_API_KEY ||
  !env.CLOUDINARY_API_SECRET
) {
  throw new Error("Missing Cloudinary configuration");
}

// Configure cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

// Define allowed folders to prevent arbitrary folder creation
export const CLOUDINARY_FOLDERS = {
  USERS: "users",
  SHOPS: "shops",
  PRODUCTS: "products",
  EVENTS: "events",
  MESSAGES: "messages",
} as const;

type CloudinaryFolder =
  (typeof CLOUDINARY_FOLDERS)[keyof typeof CLOUDINARY_FOLDERS];

// Define upload options type
export interface CloudinaryUploadOptions extends Partial<UploadApiOptions> {
  folder: CloudinaryFolder;
  width?: number;
  height?: number;
  crop?: string;
  quality?: number;
}

// Define response type
export interface CloudinaryResponse {
  public_id: string;
  url: string;
}

// Helper function for uploading files
export async function uploadToCloudinary(
  file: string,
  options: CloudinaryUploadOptions
): Promise<CloudinaryResponse> {
  try {
    if (!file) {
      throw new Error("No file provided");
    }

    // Validate folder
    if (!Object.values(CLOUDINARY_FOLDERS).includes(options.folder)) {
      throw new Error("Invalid folder specified");
    }

    const uploadOptions: CloudinaryUploadOptions = {
      ...options,
      quality: options.quality || 90, // Default quality
      resource_type: "auto", // Automatically detect resource type
    };

    const result: UploadApiResponse = await cloudinary.uploader.upload(
      file,
      uploadOptions
    );

    return {
      public_id: result.public_id,
      url: result.secure_url,
    };
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to upload file to Cloudinary"
    );
  }
}

// Helper function for deleting files
export async function deleteFromCloudinary(
  public_id: string
): Promise<boolean> {
  try {
    if (!public_id) {
      throw new Error("No public_id provided");
    }

    const result = await cloudinary.uploader.destroy(public_id);
    return result.result === "ok";
  } catch (error) {
    console.error("Cloudinary deletion failed:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to delete file from Cloudinary"
    );
  }
}

// Helper function for bulk deletion
export async function bulkDeleteFromCloudinary(
  public_ids: string[]
): Promise<boolean> {
  try {
    if (!public_ids.length) {
      return true;
    }

    const result = await cloudinary.api.delete_resources(public_ids);
    return result.deleted_counts > 0;
  } catch (error) {
    console.error("Cloudinary bulk deletion failed:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to delete files from Cloudinary"
    );
  }
}

// Verify Cloudinary connection
export async function verifyCloudinaryConnection(): Promise<boolean> {
  try {
    await cloudinary.api.ping();
    return true;
  } catch (error) {
    console.error("Cloudinary connection failed:", error);
    return false;
  }
}

export { cloudinary };
