import dbConnect from "@/lib/dbConnect";
import PostModel from "@/model/Post.model";
import { authOptions } from "../../auth/[...nextauth]/options";
import { getServerSession, User } from "next-auth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import fs from "fs/promises";
import { revalidatePath } from "next/cache";

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
    const file = formData.get("blog-image") as File;
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const content = formData.get("content") as string;
    const visibility = formData.has("visibility")
      ? formData.get("visibility") === "true"
      : true;

    const localFilePath = `./public/uploads/${file.name}`;

    if (!title || !slug || !content || !visibility) {
      return Response.json(
        {
          success: false,
          message: "Some fields are missing",
        },
        { status: 401 }
      );
    }

    let imgUrl = "";

    if (file) {
      if (file.size > 5 * 1024 * 1024 || !file.type.startsWith("image/")) {
        return Response.json(
          { success: false, message: "Invalid file type or size" },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      await fs.writeFile(localFilePath, buffer);

      revalidatePath("/");

      const uploadResult = await uploadToCloudinary(localFilePath);

      if (!uploadResult) {
        await fs.unlink(localFilePath);
        return Response.json(
          { success: false, message: "Failed to upload to Cloudinary" },
          { status: 500 }
        );
      }

      imgUrl = uploadResult.secure_url;
      await fs.unlink(localFilePath);
    }

    await PostModel.create({
      userId: user._id,
      title,
      slug,
      blogContent: content,
      visibility,
      image: imgUrl,
      comments: [],
    });

    return Response.json(
      {
        success: true,
        message: "Blog post created successfully",
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
