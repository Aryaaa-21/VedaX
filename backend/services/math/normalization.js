const normalizeAnswer = (answer) => String(answer ?? "")
  .trim()
  .replace(/\s+/g, "")
  .replace(/,/g, "");

const parseFiniteNumber = (answer) => {
  const normalized = normalizeAnswer(answer);
  if (!normalized || !/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(normalized)) return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
};

const answersEquivalent = (expected, submitted, tolerance = 1e-9) => {
  if (Array.isArray(expected)) {
    const submittedValues = String(submitted).split(",").map(parseFiniteNumber);
    return submittedValues.length === expected.length && submittedValues.every((value, index) => value !== null && Math.abs(value - expected[index]) <= tolerance);
  }

  const expectedNumber = typeof expected === "number" ? expected : parseFiniteNumber(expected);
  const submittedNumber = parseFiniteNumber(submitted);
  if (expectedNumber !== null && submittedNumber !== null) {
    return Math.abs(expectedNumber - submittedNumber) <= tolerance;
  }

  return normalizeAnswer(expected) === normalizeAnswer(submitted);
};

module.exports = { normalizeAnswer, parseFiniteNumber, answersEquivalent };
