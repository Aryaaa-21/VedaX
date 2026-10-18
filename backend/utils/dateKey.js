const dateKeyFromDate = (date = new Date()) => new Date(date).toISOString().slice(0, 10);

const dayDifference = (fromKey, toKey) => {
  if (!fromKey || !toKey) return null;
  const from = Date.parse(`${fromKey}T00:00:00.000Z`);
  const to = Date.parse(`${toKey}T00:00:00.000Z`);
  if (!Number.isFinite(from) || !Number.isFinite(to)) return null;
  return Math.round((to - from) / 86400000);
};

module.exports = { dateKeyFromDate, dayDifference };
