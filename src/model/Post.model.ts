import mongoose, { Schema, Document } from "mongoose";
import { User } from "./User.model";

export interface Comment extends Document {
  content: string;
  commentedByUserId: User;
}

const CommentSchema: Schema<Comment> = new Schema(
  {
    content: {
      type: String,
      required: [true, "Comment content is required"],
      maxlength: 128,
    },
    commentedByUserId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export interface Post extends Document {
  userId: User;
  title: string;
  blogContent: string;
  image: string;
  visibility: boolean;
  comments: Comment[];
  likes: number;
}

const PostSchema: Schema<Post> = new Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      required: [true, "Post title is required"],
      trim: true,
      maxlength: 64,
    },
    blogContent: {
      type: String,
      required: [true, "Blog content is required"],
    },
    image: {
      type: String,
    },
    visibility: {
      type: Boolean,
      default: true,
    },
    comments: [CommentSchema],
    likes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const PostModel =
  (mongoose.models.Post as mongoose.Model<Post>) ||
  mongoose.model("Post", PostSchema);

export default PostModel;
