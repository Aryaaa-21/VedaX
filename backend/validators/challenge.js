const { z } = require("zod");

const completeChallengeSchema = z.object({ idempotencyKey: z.string().trim().min(8).max(120) });
const challengeQuerySchema = z.object({ limit: z.string().regex(/^\d+$/).optional() });

module.exports = { completeChallengeSchema, challengeQuerySchema };
