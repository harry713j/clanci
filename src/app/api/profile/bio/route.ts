import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

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
    const { bio } = await request.json();

    if (!bio) {
      return Response.json(
        {
          success: false,
          message: "Bio field is not provide",
        },
        { status: 401 }
      );
    }

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

    existingUser.bio = bio;

    const updatedUser = await existingUser.save();

    return Response.json(
      {
        success: true,
        message: "Bio updated successfully",
        user: updatedUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("Error in update bio", error);
    return Response.json(
      { success: false, message: "Error updating bio" },
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

    existingUser.bio = "";

    const updatedUser = await existingUser.save();

    return Response.json(
      {
        success: true,
        message: "Bio deleted successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error in delete bio", error);
    return Response.json(
      { success: false, message: "Error deleting bio" },
      { status: 500 }
    );
  }
}
