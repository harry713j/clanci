import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { username, code } = await request.json();
    const decodeUsername = decodeURIComponent(username);

    const user = await UserModel.findOne({
      username: decodeUsername,
    });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User does not exists",
        },
        { status: 400 }
      );
    }

    const isValidCode = user.verificationCode === code;
    const isCodeNotExpired = user.verificationCodeExpiry > new Date();

    if (isCodeNotExpired && isValidCode) {
      user.isVerified = true;

      await user.save();

      return Response.json(
        {
          success: true,
          message: "User verified successfully",
        },
        { status: 201 }
      );
    } else if (!isCodeNotExpired) {
      return Response.json(
        {
          success: false,
          message:
            "Verification code expired, please sign up again to generate code",
        },
        { status: 400 }
      );
    } else {
      return Response.json(
        {
          success: false,
          message: "Incorrect Verification code ",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.log("Error in verify code", error);
    return Response.json(
      {
        success: false,
        message: "Failed to verify code",
      },
      { status: 500 }
    );
  }
}
