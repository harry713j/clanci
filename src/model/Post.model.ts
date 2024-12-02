import mongoose, { Schema, Document } from "mongoose";

export interface Comment extends Document {
  content: string;
  commentedByUserId: mongoose.Types.ObjectId;
}

const CommentSchema: Schema<Comment> = new Schema(
  {
    content: {
      type: String,
      required: [true, "Comment content is required"],
      maxlength: 128,
    },
    commentedByUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export interface Post extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  blogContent: string;
  images: Array<string>;
  visibility: boolean;
  comments: Comment[];
  likes: mongoose.Types.ObjectId[];
  categories: Array<string>;
}

const PostSchema: Schema<Post> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      required: [true, "Post title is required"],
      trim: true,
      maxlength: 64,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      index: true,
    },
    blogContent: {
      type: String,
      required: [true, "Blog content is required"],
    },
    images: {
      type: [String],
    },
    visibility: {
      type: Boolean,
      default: true,
    },
    comments: [CommentSchema],
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        unique: true,
      },
    ],
    categories: {
      type: [String],
      required: [true, "Blog categories is required"],
    },
  },
  { timestamps: true }
);

const PostModel =
  (mongoose.models.Post as mongoose.Model<Post>) ||
  mongoose.model("Post", PostSchema);

export default PostModel;
