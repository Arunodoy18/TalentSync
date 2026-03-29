import type { FastifyInstance } from "fastify";

export async function registerAnalyticsRoutes(app: FastifyInstance) {
  app.get("/analytics/dashboard", { preHandler: [app.authenticate] }, async (request) => {
    const userId = (request.user as { sub: string }).sub;

    const analytics = await app.db.query(
      "select applications_sent, interviews, responses, rejections, resume_score, updated_at from analytics where user_id = $1",
      [userId]
    );

    return {
      ok: true,
      data:
        analytics.rows[0] ?? {
          applications_sent: 0,
          interviews: 0,
          responses: 0,
          rejections: 0,
          resume_score: null,
          updated_at: null,
        },
    };
  });
}
