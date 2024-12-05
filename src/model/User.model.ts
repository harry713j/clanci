import mongoose, { Schema, Document } from "mongoose";

export interface User extends Document {
  username: string;
  email: string;
  password: string;
  isVerified: boolean;
  verificationCode: string;
  verificationCodeExpiry: Date;
  profilePicture: string;
  bio: string;
  firstName: string;
  lastName: string;
  posts: mongoose.Types.ObjectId[];
  interests: string[];
}

const UserSchema: Schema<User> = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    verificationCode: {
      type: String,
      required: [true, "Verification code is required"],
    },
    verificationCodeExpiry: {
      type: Date,
      required: [true, "Verification code expiry is required"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    profilePicture: {
      type: String,
    },
    bio: {
      type: String,
      maxlength: 255,
    },
    firstName: {
      type: String,
      maxlength: 24,
    },
    lastName: {
      type: String,
      maxlength: 24,
    },
    interests: {
      type: [String],
    },
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
  },
  { timestamps: true }
);

const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model("User", UserSchema);

export default UserModel;
