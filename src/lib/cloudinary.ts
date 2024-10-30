import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(localFilePath: string) {
  try {
    if (!localFilePath) return null;

    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: "blog_images",
      resource_type: "image",
    });

    fs.unlinkSync(localFilePath);
    console.log("Cloudinary response: ", result);
    return result;
  } catch (error) {
    console.log("Failed to upload to Cloudinary ", error);
    return null;
  }
}

export async function deleteFromCloudinary(publicUrl: string) {
  try {
    const publicId = publicUrl.split("/").pop()?.split(".")[0];
    if (!publicId) throw new Error("Invalid public URL");

    const result = await cloudinary.uploader.destroy(publicUrl);
    console.log("Cloudinary delete response ", result);
    return result;
  } catch (error) {
    console.log("Failed to delete from Cloudinary ", error);
    return null;
  }
}
