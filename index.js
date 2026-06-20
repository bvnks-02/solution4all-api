import express from "express";
import { dbConnection } from "./Database/dbConnection.js";
import { bootstrap } from "./src/bootstrap.js";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./src/config/swagger.js";

import { apiLimiter } from "./src/middlewares/rateLimiter.js";
import { sanitizeInput } from "./src/middlewares/sanitize.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;

// Ensure upload directories exist (Nixpacks/Coolify doesn't run our Dockerfile)
const uploadDirs = ["uploads", "uploads/products", "uploads/category"];
for (const dir of uploadDirs) {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

// CORS — allow all origins
app.use(cors());

app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use("/api", apiLimiter);
app.use(express.json());
app.use(sanitizeInput);

// Logging (dev only)
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Swagger API docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Static file serving for uploads — mount at /uploads so /uploads/products/x.jpg works
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check / root route — prevents 404 on "/" in production (Docker, load balancers)
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Solution4All API",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

bootstrap(app);
dbConnection();
app.listen(port, () => console.log(`Server running on port ${port}`));
