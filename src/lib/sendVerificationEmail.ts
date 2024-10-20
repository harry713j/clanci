import nodemailer, { SendMailOptions } from "nodemailer";
import { ApiResponse } from "@/types/ApiResponse";

type EmailPayload = {
  to: string;
  html: string;
};

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export async function sendVerificationEmail(
  data: EmailPayload
): Promise<ApiResponse> {
  try {
    const options: SendMailOptions = {
      from: { name: "Clanci Blog", address: process.env.USER_EMAIL! },
      subject: "Verification code!",
      ...data,
    };

    // const htmlEmail = `<div>
    // <h2>Hello ${username}, your verification code </h2>
    // <h1>${verificationCode}</h1>
    // </div>`;

    // const options: SendMailOptions = {
    //   from: { name: "Clanci Blog", address: process.env.USER_EMAIL! },
    //   to: email,
    //   subject: "Verification code!",
    //   html: htmlEmail,
    // };

    await transporter.sendMail(options);

    return { success: true, message: "Success sending verification email" };
  } catch (error) {
    console.error("Error while send verification email: ", error);
    return { success: false, message: "Failed to send verification email" };
  }
}
