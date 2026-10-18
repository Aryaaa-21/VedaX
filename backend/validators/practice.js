const { z } = require("zod");

const startSessionSchema = z.object({
  mode: z.enum(["practice", "sutra", "challenge", "daily-challenge"]).default("practice"),
  techniqueIds: z.array(z.string().trim().min(1).max(80)).max(16).optional(),
  questionCount: z.number().int().min(1).max(50).default(5),
  difficulty: z.number().int().min(1).max(3).default(1),
  clientVersion: z.string().trim().max(80).optional()
});

const attemptSchema = z.object({
  sequence: z.number().int().min(0),
  answer: z.union([z.string(), z.number()]).transform(String).pipe(z.string().max(200)),
  responseTimeMs: z.number().finite().min(0).max(300000).default(0),
  hintUsed: z.boolean().default(false),
  idempotencyKey: z.string().trim().min(8).max(120)
});

const completeSchema = z.object({ idempotencyKey: z.string().trim().min(8).max(120) });

module.exports = { startSessionSchema, attemptSchema, completeSchema };
