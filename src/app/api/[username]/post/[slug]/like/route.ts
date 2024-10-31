import dbConnect from "@/lib/dbConnect";
import PostModel from "@/model/Post.model";
import UserModel from "@/model/User.model";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession, User } from "next-auth";
import { Types } from "mongoose";

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
    }).select("likes");

    if (!existingPost) {
      return Response.json(
        {
          success: false,
          message: "Post not found",
        },
        { status: 404 }
      );
    }

    const userId = new Types.ObjectId(user._id);
    const hasLiked = existingPost.likes.includes(userId);

    if (hasLiked) {
      existingPost.likes = existingPost.likes.filter(
        (id) => !id.equals(userId)
      );
    } else {
      existingPost.likes.push(userId);
    }

    await existingPost.save();

    return Response.json(
      {
        success: true,
        message: hasLiked
          ? "Like removed successfully"
          : "Like added successfully",
        likesCount: existingPost.likes.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error in updating like", error);
    return Response.json(
      {
        success: false,
        message: "Failed to update the like",
      },
      { status: 500 }
    );
  }
}
