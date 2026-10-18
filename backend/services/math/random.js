const crypto = require("crypto");

const hashSeed = (seed) => {
  const digest = crypto.createHash("sha256").update(String(seed)).digest();
  return digest.readUInt32BE(0) || 1;
};

const createRandom = (seed) => {
  let state = hashSeed(seed);
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
};

const integerBetween = (random, min, max) => Math.floor(random() * (max - min + 1)) + min;

module.exports = { createRandom, integerBetween };
