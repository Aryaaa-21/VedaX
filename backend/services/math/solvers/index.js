const { MathEngineError } = require("../errors");

const solveQuestion = (question) => {
  const d = question.solutionData;
  switch (question.operation) {
    case "square-ending-in-five": return d.left * 100 + d.right;
    case "near-base-multiplication": return (question.operands[0] * question.operands[1]);
    case "symmetric-linear-system": return d.x;
    case "near-base-square": return d.reduced * d.base + d.deficitSquare;
    case "multiply-by-nines": return d.number * d.multiplier;
    case "factor-quadratic": return d.smaller;
    case "integer-multiplication": return d.a * d.b;
    case "sub-base-multiplication": return (d.base + d.offsetA) * (d.base + d.offsetB);
    case "complete-square": return d.roots[0];
    case "fraction-leading-digit": return d.firstNonZeroDigit;
    case "symmetric-rational-equation": return d.center;
    case "integer-division-remainder": return d.dividend % d.divisor;
    case "linear-equation": return d.c;
    case "quadratic-derivative": return 2 * d.a * d.x + d.b;
    case "coefficient-sum-product": return d.factorSumA * d.factorSumB;
    case "factor-coefficient-sums": return d.divisorSum * d.quotientSum;
    default: throw new MathEngineError(`No solver for operation: ${question.operation}`, "UNSUPPORTED_OPERATION");
  }
};

module.exports = { solveQuestion };
