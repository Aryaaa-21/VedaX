const DEFAULT_AVATAR = "https://lh3.googleusercontent.com/a/default-user";

const toSafeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role || "user",
  joinedDate: user.joinedDate,
  level: user.level,
  xp: user.xp,
  streak: user.streak,
  accuracy: user.accuracy,
  badges: user.badges || [],
  completedTechniques: user.completedTechniques || [],
  challengeHistory: user.challengeHistory || [],
  profileImage: user.profileImage || "",
  avgSpeed: user.avgSpeed || 0,
  completedLessons: user.completedLessons || 0,
  challengeHighScore: user.challengeHighScore || 0,
  avatar: user.avatar || user.profileImage || DEFAULT_AVATAR,
  recentActivities: user.recentActivities || []
});

module.exports = { toSafeUser, DEFAULT_AVATAR };
