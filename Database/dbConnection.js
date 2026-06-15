import mongoose from "mongoose";

export function dbConnection() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI environment variable is not set");
    process.exit(1);
  }

  mongoose.set("strictQuery", true);

  mongoose
    .connect(uri)
    .then(() => {
      console.log("✅ DB Connected Successfully");
    })
    .catch((error) => {
      console.error("❌ DB Failed to connect:", error.message);
      console.error("   Check that MongoDB is running and MONGODB_URI is correct in .env");
      process.exit(1);
    });
}
