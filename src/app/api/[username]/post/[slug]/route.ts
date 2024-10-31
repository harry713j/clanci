import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import PostModel from "@/model/Post.model";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession, User } from "next-auth";
import mongoose from "mongoose";
import { deleteFromCloudinary, uploadToCloudinary } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";

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
    const visibility = formData.has("visibility")
      ? formData.get("visibility") === "true"
      : true;

    const file = formData.get("blog-image") as File;

    const localFilePath = `./public/uploads/${file.name}`;

    let newImgUrl = "";
    if (file) {
      const existingPost = await PostModel.findOne({
        userId: postOwner._id,
        slug,
      });

      if (existingPost?.image) {
        await deleteFromCloudinary(existingPost.image);
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      await fs.writeFile(localFilePath, buffer);

      revalidatePath("/");

      const uploadResult = await uploadToCloudinary(localFilePath);

      if (!uploadResult) {
        await fs.unlink(localFilePath);
        return Response.json(
          { success: false, message: "Failed to upload to Cloudinary" },
          { status: 500 }
        );
      }

      newImgUrl = uploadResult.secure_url;
      await fs.unlink(localFilePath);
    }

    const updatedPost = await PostModel.findOneAndUpdate(
      { userId: postOwner._id, slug },
      {
        $set: {
          title,
          slug: postSlug,
          blogContent: content,
          visibility,
          image: newImgUrl,
        },
      },
      { new: true }
    );

    if (!updatedPost) {
      return Response.json(
        {
          success: false,
          message: "Post not found or failed to update",
        },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Post updated successfully",
        post: updatedPost,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error updating the blog", error);
    return Response.json(
      {
        success: false,
        message: "Failed to update the blog",
      },
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

    const deletedPost = await PostModel.findOneAndDelete({
      userId: postOwner._id,
      slug,
    });

    if (!deletedPost) {
      return Response.json(
        {
          success: false,
          message: "Post not found or Failed to delete ",
        },
        { status: 404 }
      );
    }

    if (deletedPost.image) {
      await deleteFromCloudinary(deletedPost.image);
    }

    return Response.json(
      {
        success: true,
        message: "Post delete successful",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error deleting the blog", error);
    return Response.json(
      {
        success: false,
        message: "Failed to delete the blog",
      },
      { status: 500 }
    );
  }
}
