import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { enqueueAutoApply } from "../services/automation-client.js";
import { enqueueOutboxEvent } from "../services/outbox.service.js";

export async function registerApplyRoutes(app: FastifyInstance) {
  app.post("/apply/auto", { preHandler: [app.authenticate] }, async (request) => {
    const body = z
      .object({
        jobId: z.string().uuid(),
        resumeId: z.string().uuid(),
      })
      .parse(request.body);

    const userId = (request.user as { sub: string }).sub;

    const queued = await enqueueAutoApply({
      user_id: userId,
      job_id: body.jobId,
      resume_id: body.resumeId,
    });

    const appInsert = await app.db.query(
      `insert into applications(user_id, job_id, resume_version, application_status, applied_at, source)
       values($1, $2, $3, 'queued', now(), 'automation')
       returning id, user_id, job_id, resume_version, application_status, applied_at, created_at`,
      [userId, body.jobId, body.resumeId]
    );

    await enqueueOutboxEvent({
      db: app.db,
      aggregateType: "application",
      aggregateId: String(appInsert.rows[0].id),
      eventType: "autoapply.requested",
      payload: {
        userId,
        jobId: body.jobId,
        resumeId: body.resumeId,
        queueJobId: queued.data.queue_job_id ?? null,
      },
    });

    return {
      ok: true,
      data: {
        ...body,
        status: "auto_apply_queued",
        queueJobId: queued.data.queue_job_id ?? null,
        applicationId: appInsert.rows[0].id,
      },
    };
  });

  app.get("/apply/status", { preHandler: [app.authenticate] }, async (request) => {
    const userId = (request.user as { sub: string }).sub;
    const result = await app.db.query(
      "select id, user_id, job_id, application_status, applied_at, created_at from applications where user_id = $1 order by created_at desc limit 50",
      [userId]
    );

    return { ok: true, data: result.rows };
  });
}
