import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import bcryptjs from "bcryptjs";
import { sendVerificationEmail } from "@/lib/sendVerificationEmail";
import { generateVerifyCode } from "@/utils/generateCode";
import { render } from "@react-email/render";
import VerificationEmailTemplate from "../../../../emails/verificationEmailTemplate";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, email, password } = await request.json();

    const existingVerifiedUserByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUserByUsername) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 400 }
      );
    }

    const existingUserWithEmail = await UserModel.findOne({
      email,
    });

    const verificationCode = generateVerifyCode();

    if (existingUserWithEmail) {
      if (existingUserWithEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: "User is already exists with this email",
          },
          { status: 400 }
        );
      } else {
        const hashedPassword = await bcryptjs.hash(password, 10);
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1);

        existingUserWithEmail.password = hashedPassword;
        existingUserWithEmail.verificationCode = verificationCode;
        existingUserWithEmail.verificationCodeExpiry = expiryDate;

        await existingUserWithEmail.save();
      }
    } else {
      const hashedPassword = await bcryptjs.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      await UserModel.create({
        username,
        email,
        password: hashedPassword,
        verificationCode: verificationCode,
        verificationCodeExpiry: expiryDate,
        isVerified: false,
        posts: [],
      });
    }

    const emailResponse = await sendVerificationEmail({
      to: email,
      html: await render(
        VerificationEmailTemplate({ username, verificationCode })
      ),
    });

    if (!emailResponse.success) {
      return Response.json(
        { success: false, message: emailResponse.message },
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "User registered successfully, please verify your email",
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("Error in sign up", error);
    return Response.json(
      { success: false, message: "Error registering user" },
      { status: 500 }
    );
  }
}
