import dbConnect from "@/lib/dbConnect";
import PostModel from "@/model/Post.model";
import UserModel from "@/model/User.model";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession, User } from "next-auth";
import { Types } from "mongoose";

export async function DELETE(
  request: Request,
  { params }: { params: { username: string; slug: string; commentId: string } }
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
    const { username, slug, commentId } = params;

    const existingUser = await UserModel.findOne({ username }).select("_id");

    if (!existingUser) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const existingPost = await PostModel.findOne({
      userId: existingUser._id,
      slug,
    }).populate({
      path: "comments.commentedByUserId",
      select: "username profilePicture",
    });

    if (!existingPost) {
      return Response.json(
        {
          success: false,
          message: "Post not found",
        },
        { status: 404 }
      );
    }

    const commentIndex = existingPost.comments.findIndex(
      (comment) =>
        (comment._id as Types.ObjectId).toString() === commentId &&
        (comment.commentedByUserId._id as Types.ObjectId).toString() ===
          user._id
    );

    if (commentIndex === -1) {
      return Response.json(
        {
          success: false,
          message: "Comment not found or not authorized to delete",
        },
        { status: 404 }
      );
    }

    existingPost.comments.splice(commentIndex, 1);
    await existingPost.save();

    return Response.json(
      {
        success: true,
        message: "Comment deleted successfully",
        post: existingPost,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error in deleting comment", error);
    return Response.json(
      {
        success: false,
        message: "Failed to delete the comment",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { username: string; slug: string; commentId: string } }
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
    const { username, slug, commentId } = params;

    const existingUser = await UserModel.findOne({ username }).select("_id");

    if (!existingUser) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const existingPost = await PostModel.findOne({
      userId: existingUser._id,
      slug,
    }).populate({
      path: "comments.commentedByUserId",
      select: "username profilePicture",
    });

    if (!existingPost) {
      return Response.json(
        {
          success: false,
          message: "Post not found",
        },
        { status: 404 }
      );
    }

    const comment = existingPost.comments.find(
      (comment) =>
        (comment._id as Types.ObjectId).toString() === commentId &&
        (comment.commentedByUserId._id as Types.ObjectId).toString() ===
          user._id
    );

    if (!comment) {
      return Response.json(
        {
          success: false,
          message: "Comment not found or not authorized to delete",
        },
        { status: 404 }
      );
    }

    const { content } = await request.json();

    if (!content) {
      return Response.json(
        {
          success: false,
          message: "No comment content found",
        },
        { status: 400 }
      );
    }

    comment.content = content;
    await existingPost.save();

    return Response.json(
      {
        success: true,
        message: "Comment updated successfully",
        post: existingPost,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error in updating comment", error);
    return Response.json(
      {
        success: false,
        message: "Failed to update the comment",
      },
      { status: 500 }
    );
  }
}
