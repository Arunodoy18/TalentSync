import type { FastifyInstance } from "fastify";
import { z } from "zod";
import bcrypt from "bcryptjs";

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function registerAuthRoutes(app: FastifyInstance) {
  app.post("/auth/signup", async (request, reply) => {
    const body = signupSchema.parse(request.body);
    const passwordHash = await bcrypt.hash(body.password, 12);

    try {
      const result = await app.db.query(
        "insert into users(name, email, password_hash) values($1, $2, $3) returning id, name, email, created_at",
        [body.name, body.email.toLowerCase(), passwordHash]
      );

      return reply.code(201).send({ ok: true, data: result.rows[0] });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message.toLowerCase() : "";
      if (message.includes("duplicate") || message.includes("unique")) {
        return reply.code(409).send({ ok: false, error: "Email already exists" });
      }
      throw error;
    }
  });

  app.post("/auth/login", async (request, reply) => {
    const body = loginSchema.parse(request.body);

    const result = await app.db.query("select id, email, password_hash from users where email = $1", [body.email.toLowerCase()]);
    if (result.rowCount === 0) {
      return reply.code(401).send({ ok: false, error: "Invalid credentials" });
    }

    const user = result.rows[0] as { id: string; password_hash: string };
    const validPassword = await bcrypt.compare(body.password, user.password_hash);
    if (!validPassword) {
      return reply.code(401).send({ ok: false, error: "Invalid credentials" });
    }

    const token = await reply.jwtSign({ sub: user.id, role: "user" });
    return { ok: true, data: { token } };
  });

  app.post("/auth/logout", { preHandler: [app.authenticate] }, async () => {
    return { ok: true, data: { loggedOut: true } };
  });
}
