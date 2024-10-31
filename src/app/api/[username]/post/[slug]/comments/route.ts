import dbConnect from "@/lib/dbConnect";
import PostModel from "@/model/Post.model";
import type { Comment } from "@/model/Post.model";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession, User } from "next-auth";
import UserModel from "@/model/User.model";

// post comment on a post
export async function POST(
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
      userId: existingUser?._id,
      slug,
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

    const { content } = await request.json();

    if (!content) {
      return Response.json(
        {
          success: false,
          message: "No comment content",
        },
        { status: 400 }
      );
    }

    const newComment = {
      content: content,
      commentedByUserId: existingUser?._id,
    };

    existingPost.comments.push(newComment as Comment);
    await existingPost.save();

    return Response.json(
      {
        success: true,
        message: "Comment added successfully",
        post: existingPost,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("Error in posting comment", error);
    return Response.json(
      {
        success: false,
        message: "Failed to post the comment",
      },
      { status: 500 }
    );
  }
}

// get all the comment for a post
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
      .select("comments")
      .populate({
        path: "comments.commentedByUserId",
        select: "username profilePicture",
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
        message: "Comments fetched Successful",
        comments: post.comments,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error in getting comments", error);
    return Response.json(
      {
        success: false,
        message: "Failed to get the comments",
      },
      { status: 500 }
    );
  }
}
