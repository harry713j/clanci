import dbConnect from "@/lib/dbConnect";
import PostModel from "@/model/Post.model";
import { authOptions } from "../../auth/[...nextauth]/options";
import { getServerSession, User } from "next-auth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import fs from "fs/promises";
import { revalidatePath } from "next/cache";
import TurndownService from "turndown";

const turndownService = new TurndownService();

export async function POST(request: Request) {
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
    const formData = await request.formData();
    const files = formData.getAll("blog-images") as File[];
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const content = formData.get("content") as string;
    const categories = formData.getAll("categories") as string[];
    const visibility = formData.has("visibility")
      ? formData.get("visibility") === "true"
      : true;

    if (!title || !slug || !content || !visibility || categories.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Some fields are missing",
        },
        { status: 401 }
      );
    }

    const imgUrls: string[] = [];

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024 || !file.type.startsWith("image/")) {
        return Response.json(
          { success: false, message: "Invalid file type or size" },
          { status: 400 }
        );
      }

      const localFilePath = `./public/uploads/${file.name}`;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      await fs.writeFile(localFilePath, buffer);

      const uploadResult = await uploadToCloudinary(localFilePath);
      await fs.unlink(localFilePath);

      if (uploadResult?.secure_url) {
        imgUrls.push(uploadResult.secure_url);
      } else {
        return Response.json(
          { success: false, message: "Failed to upload to Cloudinary" },
          { status: 500 }
        );
      }
    }

    const markdownContent = turndownService.turndown(content);

    const newPost = await PostModel.create({
      userId: user._id,
      title,
      slug,
      categories: [...categories],
      blogContent: markdownContent,
      visibility,
      images: imgUrls,
      comments: [],
    });

    revalidatePath("/");

    return Response.json(
      {
        success: true,
        message: "Blog post created successfully",
        post: newPost,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("Error posting the blog", error);
    return Response.json(
      {
        success: false,
        message: "Failed to post the blog",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  await dbConnect();

  try {
    // will change it according to front-end need
    const blogs = await PostModel.find({}).sort({ createdAt: -1 });

    if (blogs.length === 0) {
      return Response.json(
        {
          success: false,
          message: "No blog found",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Blogs found",
      posts: blogs,
    });
  } catch (error) {
    console.log("Error getting the blogs", error);
    return Response.json(
      {
        success: false,
        message: "Failed to get the blogs",
      },
      { status: 500 }
    );
  }
}
