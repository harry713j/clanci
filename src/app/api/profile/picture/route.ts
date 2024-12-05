import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
import fs from "fs/promises";

export async function PATCH(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  if (!session || !user) {
    return Response.json(
      {
        success: false,
        message: "Not Authenticated",
      },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("picture") as File;

    const existingUser = await UserModel.findOne({
      username: user.username,
    });

    if (!existingUser) {
      return Response.json(
        {
          success: false,
          message: "User not exists",
        },
        { status: 404 }
      );
    }

    if (file.size > 5 * 1024 * 1024 || !file.type.startsWith("image/")) {
      return Response.json(
        { success: false, message: "Invalid file type or size" },
        { status: 400 }
      );
    }

    const localFilePath = `./public/uploads/${file.name}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    await fs.writeFile(localFilePath, buffer);

    const uploadResult = await uploadToCloudinary(localFilePath);
    await fs.unlink(localFilePath);

    if (!uploadResult?.secure_url) {
      return Response.json(
        { success: false, message: "Failed to upload to Cloudinary" },
        { status: 500 }
      );
    }

    existingUser.profilePicture = uploadResult.secure_url;

    const updatedUser = await existingUser.save();

    return Response.json(
      {
        success: true,
        message: "User profile picture updated successfully",
        user: updatedUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("Error in update profile picture", error);
    return Response.json(
      { success: false, message: "Error updating profile picture" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  if (!session || !user) {
    return Response.json(
      {
        success: false,
        message: "Not Authenticated",
      },
      { status: 401 }
    );
  }

  try {
    const existingUser = await UserModel.findOne({
      username: user.username,
    });

    if (!existingUser) {
      return Response.json(
        {
          success: false,
          message: "User not exists",
        },
        { status: 404 }
      );
    }
    if (existingUser.profilePicture) {
      const deleteResult = await deleteFromCloudinary(
        existingUser.profilePicture
      );

      if (!deleteResult || deleteResult.result !== "ok") {
        return Response.json(
          { success: false, message: "Failed to delete from Cloudinary" },
          { status: 500 }
        );
      }
    }

    existingUser.profilePicture = "";

    const updatedUser = await existingUser.save();

    return Response.json(
      {
        success: true,
        message: "User profile picture updated successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error in delete profile picture", error);
    return Response.json(
      { success: false, message: "Error deleting profile picture" },
      { status: 500 }
    );
  }
}
