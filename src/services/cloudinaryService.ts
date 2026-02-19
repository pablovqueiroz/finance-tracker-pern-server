import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import "../../config/cloudinary.js";

export const uploadImage = async (
  fileBuffer: Buffer,
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "finance-tracker",
        transformation: [{ width: 500, height: 500, crop: "limit" }],
        allowed_formats: ["jpg", "jpeg", "png"],
      },
      (
        error: UploadApiErrorResponse | undefined,
        result: UploadApiResponse | undefined,
      ) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error.message || error);
          return reject(error);
        }

        if (!result) {
          const noResultError = new Error(
            "Upload failed: No result from Cloudinary",
          );
          console.error(noResultError.message);
          return reject(noResultError);
        }

        resolve(result);
      },
    );
    uploadStream.on("error", (err) => {
      console.error("Stream Connection Error:", err);
      reject(err);
    });

    uploadStream.end(fileBuffer);
  });
};
