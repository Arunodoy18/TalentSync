import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { atsScore, parseResume, tailorResume } from "../services/ai-client.js";
import { enqueueOutboxEvent } from "../services/outbox.service.js";

const uploadSchema = z.object({
  fileUrl: z.string().url(),
  title: z.string().min(1).optional(),
});

const parseSchema = z.object({
  resumeId: z.string().uuid(),
  rawText: z.string().min(40),
});

const atsSchema = z.object({
  resumeId: z.string().uuid(),
  jobDescription: z.string().min(20),
});

const tailorSchema = z.object({
  resumeId: z.string().uuid(),
  targetJobId: z.string().uuid(),
});

export async function registerResumeRoutes(app: FastifyInstance) {
  app.post("/resume/upload", { preHandler: [app.authenticate] }, async (request) => {
    const body = uploadSchema.parse(request.body);
    const userId = (request.user as { sub: string }).sub;

    const result = await app.db.query(
      "insert into resumes(user_id, title, resume_file_url) values($1, $2, $3) returning id, user_id, title, resume_file_url, created_at",
      [userId, body.title ?? "Untitled Resume", body.fileUrl]
    );

    return { ok: true, data: result.rows[0] };
  });

  app.get("/resume/:id", { preHandler: [app.authenticate] }, async (request, reply) => {
    const params = z.object({ id: z.string().uuid() }).parse(request.params);
    const userId = (request.user as { sub: string }).sub;

    const result = await app.db.query(
      "select id, user_id, title, resume_file_url, parsed_json, ats_score, created_at from resumes where id = $1 and user_id = $2",
      [params.id, userId]
    );

    if (result.rowCount === 0) {
      return reply.code(404).send({ ok: false, error: "Resume not found" });
    }

    return { ok: true, data: result.rows[0] };
  });

  app.post("/resume/parse", { preHandler: [app.authenticate] }, async (request, reply) => {
    const body = parseSchema.parse(request.body);
    const userId = (request.user as { sub: string }).sub;

    const existingResume = await app.db.query("select id from resumes where id = $1 and user_id = $2", [body.resumeId, userId]);
    if (existingResume.rowCount === 0) {
      return reply.code(404).send({ ok: false, error: "Resume not found" });
    }

    const parsed = await parseResume(body.rawText);
    await app.db.query("update resumes set parsed_json = $1 where id = $2", [parsed.entities, body.resumeId]);

    await enqueueOutboxEvent({
      db: app.db,
      aggregateType: "resume",
      aggregateId: body.resumeId,
      eventType: "resume.parsed",
      payload: {
        resumeId: body.resumeId,
        skillCount: parsed.skills.length,
      },
    });

    return { ok: true, data: { resumeId: body.resumeId, parsed } };
  });

  app.post("/resume/ats-score", { preHandler: [app.authenticate] }, async (request, reply) => {
    const body = atsSchema.parse(request.body);
    const userId = (request.user as { sub: string }).sub;

    const resume = await app.db.query("select parsed_json from resumes where id = $1 and user_id = $2", [body.resumeId, userId]);
    if (resume.rowCount === 0) {
      return reply.code(404).send({ ok: false, error: "Resume not found" });
    }
    const resumeJson = (resume.rows[0]?.parsed_json ?? {}) as Record<string, unknown>;
    const scored = await atsScore(resumeJson, body.jobDescription);

    await app.db.query("update resumes set ats_score = $1 where id = $2", [scored.score, body.resumeId]);

    await enqueueOutboxEvent({
      db: app.db,
      aggregateType: "resume",
      aggregateId: body.resumeId,
      eventType: "resume.ats_scored",
      payload: {
        resumeId: body.resumeId,
        score: scored.score,
      },
    });

    return { ok: true, data: { resumeId: body.resumeId, ...scored } };
  });

  app.post("/resume/tailor", { preHandler: [app.authenticate] }, async (request, reply) => {
    const body = tailorSchema.parse(request.body);
    const userId = (request.user as { sub: string }).sub;

    const resume = await app.db.query("select parsed_json from resumes where id = $1 and user_id = $2", [body.resumeId, userId]);
    if (resume.rowCount === 0) {
      return reply.code(404).send({ ok: false, error: "Resume not found" });
    }

    const job = await app.db.query("select job_description from jobs where id = $1", [body.targetJobId]);
    if (job.rowCount === 0) {
      return reply.code(404).send({ ok: false, error: "Job not found" });
    }

    const resumeJson = (resume.rows[0]?.parsed_json ?? {}) as Record<string, unknown>;
    const jobDescription = String(job.rows[0]?.job_description ?? "");

    const tailored = await tailorResume(resumeJson, jobDescription);

    await enqueueOutboxEvent({
      db: app.db,
      aggregateType: "resume",
      aggregateId: body.resumeId,
      eventType: "resume.tailored",
      payload: {
        resumeId: body.resumeId,
        targetJobId: body.targetJobId,
      },
    });

    return {
      ok: true,
      data: {
        resumeId: body.resumeId,
        targetJobId: body.targetJobId,
        tailoredResume: tailored.tailored_resume,
        notes: tailored.notes,
      },
    };
  });
}
