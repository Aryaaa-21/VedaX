const calculateAttemptScore = ({ correct, difficulty = 1, hintUsed = false }) => {
  if (!correct) return 0;
  return Math.max(1, 5 + Math.max(0, Number(difficulty) - 1) * 3 - (hintUsed ? 1 : 0));
};

const calculateSessionXp = ({ correctCount, answeredCount, difficulty = 1, averageResponseTimeMs = 0 }) => {
  if (!answeredCount || !correctCount) return 0;
  const accuracy = correctCount / answeredCount;
  const base = correctCount * 5;
  const difficultyBonus = correctCount * Math.max(0, Number(difficulty) - 1) * 2;
  const completionBonus = accuracy >= 0.8 ? 10 : 0;
  const speedBonus = averageResponseTimeMs > 0 && averageResponseTimeMs <= 3000 ? 5 : 0;
  return Math.min(500, Math.floor(base + difficultyBonus + completionBonus + speedBonus));
};

module.exports = { calculateAttemptScore, calculateSessionXp };
