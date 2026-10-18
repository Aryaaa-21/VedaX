const express = require("express");
const router = express.Router();
const { getLeaderboard } = require("../controllers/leaderboardController");
const { asyncHandler } = require("../utils/errors");
const { validate } = require("../middleware/validate");
const { leaderboardQuerySchema } = require("../validators/leaderboard");
const { requireDatabase } = require("../middleware/database");

router.get("/", requireDatabase, validate(leaderboardQuerySchema, "query"), asyncHandler(getLeaderboard));

module.exports = router;
