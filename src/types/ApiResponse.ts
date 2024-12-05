import { Comment, Post } from "@/model/Post.model";
import { User } from "@/model/User.model";

export interface ApiResponse {
  success: boolean;
  message: string;
  likesCount?: number;
  user?: User;
  post?: Post;
  posts?: Array<Post>;
  comments?: Array<Comment>;
}
