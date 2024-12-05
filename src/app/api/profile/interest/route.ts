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
    const { interest } = await request.json();

    if (typeof interest !== "object" || interest.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Invalid value provided",
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

    existingUser.interests.push(...interest);

    const updatedUser = await existingUser.save();

    return Response.json(
      {
        success: true,
        message: "User interest updated successfully",
        user: updatedUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("Error in update interest", error);
    return Response.json(
      { success: false, message: "Error updating interest" },
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

    existingUser.interests = [] as string[];

    const updatedUser = await existingUser.save();

    return Response.json(
      {
        success: true,
        message: "User interest deleted successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error in delete interest", error);
    return Response.json(
      { success: false, message: "Error deleting interest" },
      { status: 500 }
    );
  }
}
