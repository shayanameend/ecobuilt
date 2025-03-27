import {
  CloudinaryResponse,
  CloudinaryUploadOptions,
  uploadToCloudinary,
  deleteFromCloudinary,
  CLOUDINARY_FOLDERS,
} from "@/lib/cloudinary";

export async function handleImageUpload(
  image: string | string[],
  folder: keyof typeof CLOUDINARY_FOLDERS,
  options: Partial<CloudinaryUploadOptions> = {}
): Promise<CloudinaryResponse | CloudinaryResponse[]> {
  try {
    if (Array.isArray(image)) {
      return Promise.all(
        image.map((img) =>
          uploadToCloudinary(img, {
            folder: CLOUDINARY_FOLDERS[folder],
            ...options,
          })
        )
      );
    }

    return await uploadToCloudinary(image, {
      folder: CLOUDINARY_FOLDERS[folder],
      ...options,
    });
  } catch (error) {
    console.error(`Failed to upload image to ${folder}:`, error);
    throw error;
  }
}

export async function handleImageDelete(
  publicId: string | string[]
): Promise<boolean> {
  try {
    if (Array.isArray(publicId)) {
      const results = await Promise.all(
        publicId.map((id) => deleteFromCloudinary(id))
      );
      return results.every((result) => result);
    }

    return await deleteFromCloudinary(publicId);
  } catch (error) {
    console.error("Failed to delete image:", error);
    throw error;
  }
}
