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
    const { firstName, lastName } = await request.json();

    if (!firstName || !lastName) {
      return Response.json(
        {
          success: false,
          message: "Please provide value for both the field",
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

    existingUser.firstName = firstName;
    existingUser.lastName = lastName;
    const updatedUser = await existingUser.save();

    return Response.json(
      {
        success: true,
        message: "Name updated successfully",
        user: updatedUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("Error in update name", error);
    return Response.json(
      { success: false, message: "Error updating name" },
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

    existingUser.firstName = "";
    existingUser.lastName = "";
    const updatedUser = await existingUser.save();

    return Response.json(
      {
        success: true,
        message: "Name deleted successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error in delete name", error);
    return Response.json(
      { success: false, message: "Error deleting name" },
      { status: 500 }
    );
  }
}
