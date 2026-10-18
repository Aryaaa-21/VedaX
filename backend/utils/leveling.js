const xpRequiredForLevel = (level) => Math.floor(100 * Math.pow(Math.max(1, level), 1.25));

const calculateLevelFromXp = (xp) => {
  let level = 1;
  let remaining = Math.max(0, Number(xp) || 0);
  while (remaining >= xpRequiredForLevel(level) && level < 1000) {
    remaining -= xpRequiredForLevel(level);
    level += 1;
  }
  return level;
};

const getProgressForXp = (xp) => {
  let level = calculateLevelFromXp(xp);
  let spent = 0;
  for (let current = 1; current < level; current += 1) spent += xpRequiredForLevel(current);
  const intoLevel = Math.max(0, Number(xp) || 0) - spent;
  return {
    level,
    xpIntoLevel: intoLevel,
    xpToNextLevel: xpRequiredForLevel(level),
    percent: Math.min(100, Math.floor((intoLevel / xpRequiredForLevel(level)) * 100))
  };
};

module.exports = { xpRequiredForLevel, calculateLevelFromXp, getProgressForXp };
