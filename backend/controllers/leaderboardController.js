const mongoose = require("mongoose");
const { AppError } = require("../utils/errors");
const { getLeaderboard, RANKING_SORT, usersAheadOf } = require("../services/leaderboardService");

const leaderboardController = async (req, res) => {
  const userId = (req.validated?.query || req.query).userId;

  if (userId && !mongoose.isValidObjectId(userId)) {
    throw new AppError("Invalid userId", 400, "INVALID_IDENTIFIER", { userId: "Invalid userId" });
  }

  return res.json(await getLeaderboard(userId));
};

module.exports = {
  getLeaderboard: leaderboardController,
  RANKING_SORT,
  usersAheadOf
};
