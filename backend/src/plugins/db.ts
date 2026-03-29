import fp from "fastify-plugin";
import { Pool } from "pg";
import type { FastifyInstance } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    db: Pool;
  }
}

async function dbPlugin(app: FastifyInstance) {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const pool = new Pool({ connectionString: databaseUrl });
  app.decorate("db", pool);

  app.addHook("onClose", async () => {
    await pool.end();
  });
}

export default fp(dbPlugin);
