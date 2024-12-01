import { Comment, Post } from "@/model/Post.model";

export interface ApiResponse {
  success: boolean;
  message: string;
  likesCount?: number;
  post?: Post;
  posts?: Array<Post>;
  comments?: Array<Comment>;
}
