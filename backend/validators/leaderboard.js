const { z } = require("zod");

const leaderboardQuerySchema = z.object({
  userId: z.string().trim().max(64).optional()
});

module.exports = { leaderboardQuerySchema };
