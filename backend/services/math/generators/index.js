const crypto = require("crypto");
const { createRandom, integerBetween } = require("../random");
const { getTechnique } = require("../techniques/catalog");
const { MathEngineError } = require("../errors");

const clampDifficulty = (difficulty) => Math.max(1, Math.min(3, Number(difficulty) || 1));

const makeQuestion = ({ techniqueId, seed, difficulty, operation, operands, prompt, expectedAnswer, solutionData, metadata = {} }) => {
  const id = crypto.createHash("sha256")
    .update(`${techniqueId}:${seed}:${difficulty}:${operation}:${JSON.stringify(operands)}`)
    .digest("hex")
    .slice(0, 24);
  const technique = getTechnique(techniqueId);
  if (!technique) throw new MathEngineError(`Unknown technique: ${techniqueId}`, "UNKNOWN_TECHNIQUE");

  return {
    id,
    techniqueId,
    techniqueName: technique.name,
    sutra: technique.sutra,
    operation,
    difficulty,
    operands,
    prompt,
    question: prompt,
    text: prompt,
    expectedAnswer,
    solutionData,
    metadata
  };
};

const generateQuestion = ({ techniqueId, seed = "default", difficulty = 1 }) => {
  const level = clampDifficulty(difficulty);
  const random = createRandom(`${techniqueId}:${seed}:${level}`);
  const wide = level === 3;

  switch (techniqueId) {
    case "ekadhikena-purvena": {
      const tens = integerBetween(random, wide ? 10 : 1, wide ? 99 : level === 2 ? 30 : 15);
      const number = tens * 10 + 5;
      return makeQuestion({ techniqueId, seed, difficulty: level, operation: "square-ending-in-five", operands: [number, number], prompt: `${number} × ${number}`, expectedAnswer: number * number, solutionData: { tens, left: tens * (tens + 1), right: 25 } });
    }
    case "nikhilam-subtraction": {
      const base = level === 1 ? 100 : level === 2 ? 1000 : 10000;
      const maximumDeficit = level === 1 ? 9 : level === 2 ? 25 : 99;
      const deficitA = integerBetween(random, 1, maximumDeficit);
      const deficitB = integerBetween(random, 1, maximumDeficit);
      const a = base - deficitA;
      const b = base - deficitB;
      return makeQuestion({ techniqueId, seed, difficulty: level, operation: "near-base-multiplication", operands: [a, b], prompt: `${a} × ${b}`, expectedAnswer: a * b, solutionData: { base, deficitA, deficitB, crossPart: a - deficitB, rightPart: deficitA * deficitB } });
    }
    case "sankalana-vyavakalanabhyam": {
      const a = integerBetween(random, 2, wide ? 30 : 12);
      const b = integerBetween(random, 1, a - 1);
      const x = integerBetween(random, 1, wide ? 12 : 5);
      const y = integerBetween(random, 1, wide ? 8 : 4);
      const c = a * x + b * y;
      const d = b * x + a * y;
      return makeQuestion({ techniqueId, seed, difficulty: level, operation: "symmetric-linear-system", operands: [a, b, c, d], prompt: `Solve ${a}x + ${b}y = ${c} and ${b}x + ${a}y = ${d}. Find x.`, expectedAnswer: x, solutionData: { a, b, x, y, c, d } });
    }
    case "yavadunam": {
      const base = level === 1 ? 100 : level === 2 ? 1000 : 10000;
      const deficit = integerBetween(random, 1, level === 1 ? 9 : level === 2 ? 25 : 99);
      const number = base - deficit;
      return makeQuestion({ techniqueId, seed, difficulty: level, operation: "near-base-square", operands: [number], prompt: `${number} × ${number}`, expectedAnswer: number * number, solutionData: { base, deficit, reduced: number - deficit, deficitSquare: deficit * deficit } });
    }
    case "ekanyunena-purvena": {
      const multiplier = random() < 0.5 ? 9 : level === 1 ? 99 : 999;
      const number = integerBetween(random, level === 1 ? 2 : 10, wide ? 999 : 99);
      return makeQuestion({ techniqueId, seed, difficulty: level, operation: "multiply-by-nines", operands: [number, multiplier], prompt: `${number} × ${multiplier}`, expectedAnswer: number * multiplier, solutionData: { number, multiplier, left: number - 1, right: multiplier - (number - 1) } });
    }
    case "vyastisamastih": {
      const smaller = integerBetween(random, 1, wide ? 12 : 5);
      const larger = smaller + integerBetween(random, 1, wide ? 9 : 4);
      const sum = smaller + larger;
      const product = smaller * larger;
      return makeQuestion({ techniqueId, seed, difficulty: level, operation: "factor-quadratic", operands: [sum, product], prompt: `Factor x² + ${sum}x + ${product}. Find the smaller positive factor constant.`, expectedAnswer: smaller, solutionData: { smaller, larger, sum, product } });
    }
    case "vertically-crosswise": {
      const a = integerBetween(random, level === 1 ? 10 : 10 ** level, 10 ** (level + 1) - 1);
      const b = integerBetween(random, level === 1 ? 10 : 10 ** level, 10 ** (level + 1) - 1);
      return makeQuestion({ techniqueId, seed, difficulty: level, operation: "integer-multiplication", operands: [a, b], prompt: `${a} × ${b}`, expectedAnswer: a * b, solutionData: { a, b } });
    }
    case "anurupyena": {
      const offsetA = integerBetween(random, -level * 4, level * 4);
      const offsetB = integerBetween(random, -level * 4, level * 4);
      const a = 50 + offsetA;
      const b = 50 + offsetB;
      return makeQuestion({ techniqueId, seed, difficulty: level, operation: "sub-base-multiplication", operands: [a, b], prompt: `${a} × ${b}`, expectedAnswer: a * b, solutionData: { base: 50, offsetA, offsetB, crossPart: 50 * (offsetA + offsetB), offsetProduct: offsetA * offsetB } });
    }
    case "puranapuranabhyam": {
      const p = integerBetween(random, 1, level === 3 ? 20 : 8);
      const q = p + integerBetween(random, 1, level === 3 ? 15 : 6);
      const rightSide = q * q - p * p;
      return makeQuestion({ techniqueId, seed, difficulty: level, operation: "complete-square", operands: [p, q, rightSide], prompt: `Solve x² + ${2 * p}x = ${rightSide}. Find the positive x.`, expectedAnswer: q - p, solutionData: { p, q, rightSide, roots: [q - p, -q - p] } });
    }
    case "sesanyankena-caramena": {
      const denominator = [19, 29, 39, 49][integerBetween(random, 0, 3)];
      let remainder = 1;
      let firstNonZeroDigit = 0;
      for (let index = 0; index < 20; index += 1) {
        remainder *= 10;
        const digit = Math.floor(remainder / denominator);
        remainder %= denominator;
        if (digit > 0) {
          firstNonZeroDigit = digit;
          break;
        }
      }
      return makeQuestion({ techniqueId, seed, difficulty: level, operation: "fraction-leading-digit", operands: [1, denominator], prompt: `For 1/${denominator}, find the first non-zero digit after the decimal point.`, expectedAnswer: firstNonZeroDigit, solutionData: { denominator, firstNonZeroDigit } });
    }
    case "sopantyadvayamantyam": {
      const center = integerBetween(random, 3, wide ? 15 : 7);
      return makeQuestion({ techniqueId, seed, difficulty: level, operation: "symmetric-rational-equation", operands: [center], prompt: `Solve 1/(x-${center + 1}) + 1/(x-${center - 1}) = 1/(x-${center + 2}) + 1/(x-${center - 2}). Find the symmetric center x.`, expectedAnswer: center, solutionData: { center } });
    }
    case "paravartya-yojayet": {
      const divisor = integerBetween(random, 101, level === 3 ? 999 : 199);
      const quotient = integerBetween(random, 2, level === 3 ? 99 : 20);
      const remainder = integerBetween(random, 0, divisor - 1);
      const dividend = divisor * quotient + remainder;
      return makeQuestion({ techniqueId, seed, difficulty: level, operation: "integer-division-remainder", operands: [dividend, divisor], prompt: `Divide ${dividend} by ${divisor}. Find the remainder.`, expectedAnswer: remainder, solutionData: { dividend, divisor, quotient, remainder } });
    }
    case "sunyam-samyasamuccaye": {
      const a = integerBetween(random, 1, 8);
      const b = integerBetween(random, 1, 8);
      const c = integerBetween(random, 1, wide ? 15 : 6);
      return makeQuestion({ techniqueId, seed, difficulty: level, operation: "linear-equation", operands: [a, b, c], prompt: `Solve (x+${a}) + (x+${b}) = x + ${a + b + c}. Find x.`, expectedAnswer: c, solutionData: { a, b, c } });
    }
    case "chalana-kalanabhyam": {
      const a = integerBetween(random, 1, wide ? 8 : 4);
      const b = integerBetween(random, 1, wide ? 12 : 6);
      const x = integerBetween(random, 1, wide ? 10 : 5);
      return makeQuestion({ techniqueId, seed, difficulty: level, operation: "quadratic-derivative", operands: [a, b, x], prompt: `For f(x) = ${a}x² + ${b}x, find f'(${x}).`, expectedAnswer: 2 * a * x + b, solutionData: { a, b, x, derivative: `2(${a})x + ${b}` } });
    }
    case "gunitasamuccayah": {
      const a = integerBetween(random, 1, wide ? 12 : 5);
      const b = integerBetween(random, 1, wide ? 12 : 5);
      return makeQuestion({ techniqueId, seed, difficulty: level, operation: "coefficient-sum-product", operands: [a, b], prompt: `For (x+${a})(x+${b}), find the sum of all coefficients after expansion.`, expectedAnswer: (1 + a) * (1 + b), solutionData: { a, b, factorSumA: 1 + a, factorSumB: 1 + b } });
    }
    case "gunakasamuccayah": {
      const a = integerBetween(random, 1, wide ? 10 : 5);
      const b = integerBetween(random, 1, wide ? 10 : 5);
      return makeQuestion({ techniqueId, seed, difficulty: level, operation: "factor-coefficient-sums", operands: [a, b], prompt: `For (x²+${a + b}x+${a * b}) ÷ (x+${a}), find the product of divisor and quotient coefficient sums.`, expectedAnswer: (1 + a) * (1 + b), solutionData: { a, b, divisorSum: 1 + a, quotientSum: 1 + b } });
    }
    default:
      throw new MathEngineError(`Unknown technique: ${techniqueId}`, "UNKNOWN_TECHNIQUE");
  }
};

module.exports = { generateQuestion, makeQuestion, clampDifficulty };
