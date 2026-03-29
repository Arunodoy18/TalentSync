import type { FastifyInstance } from "fastify";
import { z } from "zod";

export async function registerJobRoutes(app: FastifyInstance) {
  app.get("/jobs/recommend", { preHandler: [app.authenticate] }, async (request) => {
    const query = z
      .object({ limit: z.coerce.number().int().min(1).max(50).default(20) })
      .parse(request.query);

    const result = await app.db.query(
      "select id, title, company, location, salary, source, job_url, created_at from jobs order by created_at desc limit $1",
      [query.limit]
    );

    return { ok: true, data: result.rows };
  });

  app.get("/jobs/:id", { preHandler: [app.authenticate] }, async (request, reply) => {
    const params = z.object({ id: z.string().uuid() }).parse(request.params);
    const result = await app.db.query(
      "select id, title, company, location, salary, job_description, skills_required, source, job_url, created_at from jobs where id = $1",
      [params.id]
    );

    if (result.rowCount === 0) {
      return reply.code(404).send({ ok: false, error: "Job not found" });
    }

    return { ok: true, data: result.rows[0] };
  });

  app.post("/jobs/save", { preHandler: [app.authenticate] }, async (request) => {
    const body = z.object({ jobId: z.string().uuid() }).parse(request.body);
    return { ok: true, data: { jobId: body.jobId, status: "saved" } };
  });
}
