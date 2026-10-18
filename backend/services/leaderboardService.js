const User = require("../models/User");

const RANKING_SORT = {
  xp: -1,
  level: -1,
  accuracy: -1,
  challengeHighScore: -1,
  _id: 1
};

const formatEntry = (user, rank, isCurrentUser = false) => ({
  id: user._id,
  rank,
  name: user.name,
  avatar: user.avatar,
  xp: user.xp,
  accuracy: user.accuracy,
  streak: user.streak,
  isCurrentUser,
  ...(isCurrentUser ? { challengeHighScore: user.challengeHighScore } : {})
});

const usersAheadOf = (user) => ({
  $or: [
    { xp: { $gt: user.xp } },
    { xp: user.xp, level: { $gt: user.level } },
    { xp: user.xp, level: user.level, accuracy: { $gt: user.accuracy } },
    {
      xp: user.xp,
      level: user.level,
      accuracy: user.accuracy,
      challengeHighScore: { $gt: user.challengeHighScore }
    },
    {
      xp: user.xp,
      level: user.level,
      accuracy: user.accuracy,
      challengeHighScore: user.challengeHighScore,
      _id: { $lt: user._id }
    }
  ]
});

const getLeaderboard = async (userId) => {
  const topUsers = await User.find()
    .sort(RANKING_SORT)
    .limit(20)
    .select("name avatar xp accuracy streak level challengeHighScore");

  const top20 = topUsers.map((user, index) => formatEntry(user, index + 1));
  let currentUserRank = null;

  if (userId) {
    const user = await User.findById(userId).select("name avatar xp accuracy streak level challengeHighScore");
    if (user) {
      const higherCount = await User.countDocuments(usersAheadOf(user));
      currentUserRank = formatEntry(user, higherCount + 1, true);
    }
  }

  return { top20, currentUserRank };
};

module.exports = { RANKING_SORT, usersAheadOf, getLeaderboard };
