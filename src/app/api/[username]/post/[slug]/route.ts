import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import PostModel from "@/model/Post.model";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession, User } from "next-auth";
import mongoose from "mongoose";
import { deleteFromCloudinary, uploadToCloudinary } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import TurndownService from "turndown";

export async function GET(
  request: Request,
  { params }: { params: { username: string; slug: string } }
) {
  await dbConnect();

  try {
    const { username, slug } = params;
    const user = await UserModel.findOne({ username }).select("_id");

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const post = await PostModel.findOne({ userId: user._id, slug })
      .populate("userId", "username firstName lastName")
      .populate({
        path: "comments",
        populate: {
          path: "commentedByUserId",
          select: "username profilePicture",
        },
      });

    if (!post) {
      return Response.json(
        {
          success: false,
          message: "Post not found",
        },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Post found",
        post: post,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error getting the blog", error);
    return Response.json(
      {
        success: false,
        message: "Failed to get the blog",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { username: string; slug: string } }
) {
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
    const { username, slug } = params;
    const postOwner = await UserModel.findOne({ username }).select("_id");

    if (!postOwner) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    if ((postOwner?._id as mongoose.Types.ObjectId).toString() !== user._id) {
      return Response.json(
        {
          success: false,
          message: "Not Authorized",
        },
        { status: 403 }
      );
    }

    const formData = await request.formData();

    const title = formData.get("title") as string;
    const postSlug = formData.get("slug") as string;
    const content = formData.get("content") as string;
    const categories = formData.getAll("categories") as string[];
    const visibility = formData.has("visibility")
      ? formData.get("visibility") === "true"
      : true;

    const files = formData.getAll("blog-images") as File[];

    const existingPost = await PostModel.findOne({
      userId: postOwner._id,
      slug,
    });

    if (!existingPost) {
      return Response.json(
        { success: false, message: "Post not found" },
        { status: 404 }
      );
    }

    const imageUrls: string[] = [];
    if (files.length > 0) {
      for (const imageUrl of existingPost.images || []) {
        await deleteFromCloudinary(imageUrl);
      }

      for (const file of files) {
        if (file.size > 5 * 1024 * 1024 || !file.type.startsWith("image/")) {
          return Response.json(
            { success: false, message: "Invalid file type or size" },
            { status: 400 }
          );
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);
        const tempFilePath = `./public/uploads/${file.name}`;
        await fs.writeFile(tempFilePath, buffer);

        const uploadResult = await uploadToCloudinary(tempFilePath);
        await fs.unlink(tempFilePath);

        if (uploadResult?.secure_url) {
          imageUrls.push(uploadResult.secure_url);
        } else {
          return Response.json(
            { success: false, message: "Failed to upload an image" },
            { status: 500 }
          );
        }
      }
    }

    const markdownContent = new TurndownService().turndown(content);

    const updatedPost = await PostModel.findOneAndUpdate(
      { userId: postOwner._id, slug },
      {
        $set: {
          title,
          slug: postSlug,
          categories: [...categories],
          blogContent: markdownContent,
          visibility,
          images: imageUrls.length > 0 ? imageUrls : existingPost.images,
        },
      },
      { new: true }
    );

    if (!updatedPost) {
      return Response.json(
        { success: false, message: "Failed to update the post" },
        { status: 500 }
      );
    }

    revalidatePath("/");

    return Response.json(
      {
        success: true,
        message: "Post updated successfully",
        post: updatedPost,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating the blog:", error);
    return Response.json(
      { success: false, message: "Failed to update the blog" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { username: string; slug: string } }
) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  if (!session || !user) {
    return Response.json(
      { success: false, message: "Not Authenticated" },
      { status: 401 }
    );
  }

  try {
    const { username, slug } = params;
    const postOwner = await UserModel.findOne({ username }).select("_id");

    if (!postOwner) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if ((postOwner?._id as mongoose.Types.ObjectId).toString() !== user._id) {
      return Response.json(
        { success: false, message: "Not Authorized" },
        { status: 403 }
      );
    }

    const postToDelete = await PostModel.findOneAndDelete({
      userId: postOwner._id,
      slug,
    });

    if (!postToDelete) {
      return Response.json(
        { success: false, message: "Post not found or failed to delete" },
        { status: 404 }
      );
    }

    for (const imageUrl of postToDelete.images || []) {
      await deleteFromCloudinary(imageUrl);
    }

    return Response.json(
      { success: true, message: "Post deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting the blog:", error);
    return Response.json(
      { success: false, message: "Failed to delete the blog" },
      { status: 500 }
    );
  }
}
