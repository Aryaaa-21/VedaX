const { z } = require("zod");

const progressQuerySchema = z.object({
  limit: z.string().regex(/^\d+$/).optional(),
  techniqueId: z.string().trim().max(80).optional()
});

module.exports = { progressQuerySchema };
