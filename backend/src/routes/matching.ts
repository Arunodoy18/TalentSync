import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { embedding } from "../services/ai-client.js";
import { runMatch } from "../services/matching-client.js";
import { enqueueOutboxEvent } from "../services/outbox.service.js";

function parseVectorText(vectorText: string): number[] {
  const trimmed = vectorText.trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) {
    return [];
  }

  return trimmed
    .slice(1, -1)
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((n) => Number.isFinite(n));
}

export async function registerMatchingRoutes(app: FastifyInstance) {
  app.post("/match/run", { preHandler: [app.authenticate] }, async (request) => {
    const body = z
      .object({
        resumeId: z.string().uuid(),
        resumeText: z.string().min(20),
        limit: z.number().int().min(1).max(100).default(30),
      })
      .parse(request.body);

    const userId = (request.user as { sub: string }).sub;
    const resumeEmbedding = await embedding(body.resumeText);

    const jobs = await app.db.query(
      "select id, embeddings::text as embedding_text from jobs where embeddings is not null limit $1",
      [body.limit]
    );

    const candidates = jobs.rows
      .map((row) => ({
        job_id: String(row.id),
        embedding: parseVectorText(String(row.embedding_text ?? "")),
      }))
      .filter((row) => row.embedding.length > 0);

    const matched = await runMatch({
      user_id: userId,
      resume_embedding: resumeEmbedding.vector,
      candidates,
    });

    for (const item of matched.results.slice(0, 50)) {
      await app.db.query(
        `insert into job_matches(user_id, job_id, resume_id, match_score, missing_skills, status)
         values($1, $2, $3, $4, $5, 'not_applied')
         on conflict(user_id, job_id, resume_id)
         do update set match_score = excluded.match_score, updated_at = now()`,
        [userId, item.job_id, body.resumeId, Math.round(item.match_score * 10000) / 100, []]
      );
    }

    await enqueueOutboxEvent({
      db: app.db,
      aggregateType: "matching",
      aggregateId: body.resumeId,
      eventType: "matching.completed",
      payload: {
        userId,
        resumeId: body.resumeId,
        results: matched.results.length,
      },
    });

    return { ok: true, data: matched };
  });

  app.get("/match/results", { preHandler: [app.authenticate] }, async (request) => {
    const userId = (request.user as { sub: string }).sub;
    const result = await app.db.query(
      "select id, user_id, job_id, match_score, missing_skills, status, created_at from job_matches where user_id = $1 order by match_score desc limit 100",
      [userId]
    );

    return { ok: true, data: result.rows };
  });
}
