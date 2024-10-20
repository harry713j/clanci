import mongoose, { Mongoose } from "mongoose";

export default async function dbConnect(): Promise<void> {
  try {
    const db: Mongoose = await mongoose.connect(process.env.MONGODB_URI!, {});

    console.log("MongoDB connection successful ✅", db.connection.host);
  } catch (error) {
    console.error("MongoDB connection failed: ", error);
    process.exit(1);
  }
}
