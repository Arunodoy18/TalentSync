import fp from "fastify-plugin";
import jwt from "@fastify/jwt";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { sub: string; role: "user" | "admin" };
    user: { sub: string; role: "user" | "admin" };
  }
}

async function authPlugin(app: FastifyInstance) {
  const secret = process.env.BACKEND_JWT_SECRET;
  if (!secret) {
    throw new Error("BACKEND_JWT_SECRET is required");
  }

  await app.register(jwt, { secret });

  app.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.code(401).send({ ok: false, error: "Unauthorized" });
    }
  });

  app.decorate("requireAdmin", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
      if (request.user.role !== "admin") {
        return reply.code(403).send({ ok: false, error: "Forbidden" });
      }
    } catch {
      return reply.code(401).send({ ok: false, error: "Unauthorized" });
    }
  });
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export default fp(authPlugin);
