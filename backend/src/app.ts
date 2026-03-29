import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import rawBody from "fastify-raw-body";
import dbPlugin from "./plugins/db.js";
import authPlugin from "./plugins/auth.js";
import { registerAuthRoutes } from "./routes/auth.js";
import { registerResumeRoutes } from "./routes/resume.js";
import { registerJobRoutes } from "./routes/jobs.js";
import { registerMatchingRoutes } from "./routes/matching.js";
import { registerApplyRoutes } from "./routes/apply.js";
import { registerPaymentRoutes } from "./routes/payment.js";
import { registerAnalyticsRoutes } from "./routes/analytics.js";

export async function buildApp() {
  const app = Fastify({ logger: true, bodyLimit: 1_048_576 });

  const corsAllowedOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? "http://localhost:3000")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  await app.register(helmet, {
    global: true,
    contentSecurityPolicy: false,
  });
  await app.register(cors, {
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      callback(null, corsAllowedOrigins.includes(origin));
    },
    credentials: true,
  });
  await app.register(rateLimit, { max: 150, timeWindow: "1 minute" });
  await app.register(rawBody, {
    field: "rawBody",
    global: false,
    runFirst: true,
    encoding: "utf8",
  });
  await app.register(dbPlugin);
  await app.register(authPlugin);

  app.get("/health", async () => ({ ok: true, data: { status: "healthy" } }));

  await registerAuthRoutes(app);
  await registerResumeRoutes(app);
  await registerJobRoutes(app);
  await registerMatchingRoutes(app);
  await registerApplyRoutes(app);
  await registerPaymentRoutes(app);
  await registerAnalyticsRoutes(app);

  return app;
}
