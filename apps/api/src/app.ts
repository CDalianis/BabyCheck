import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { UPLOADS_ROOT } from "./config/paths.js";
import { errorHandler } from "./middleware/errorHandler.js";
import routes from "./routes/index.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json());

  app.use("/uploads", express.static(UPLOADS_ROOT));
  app.use("/api", routes);
  app.use(errorHandler);

  return app;
}
