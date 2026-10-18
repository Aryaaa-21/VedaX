const stepsFor = (question) => {
  const d = question.solutionData;
  switch (question.operation) {
    case "square-ending-in-five":
      return [{ description: `Multiply ${d.tens} by the next integer`, expression: `${d.tens} × ${d.tens + 1}`, result: d.left }, { description: "Append 25", expression: `${d.left} × 100 + 25`, result: d.left * 100 + 25 }];
    case "near-base-multiplication":
      return [{ description: `Use base ${d.base}; deficits are ${d.deficitA} and ${d.deficitB}`, expression: `${question.operands[0]} - ${d.deficitB}`, result: d.crossPart }, { description: "Multiply the deficits", expression: `${d.deficitA} × ${d.deficitB}`, result: d.rightPart }, { description: "Combine base part and deficit product", expression: `${d.crossPart} × ${d.base} + ${d.rightPart}`, result: question.expectedAnswer }];
    case "symmetric-linear-system":
      return [{ description: "Add and subtract the equations to isolate x+y and x-y", expression: `x = ${d.x}, y = ${d.y}`, result: d.x }, { description: "Verify both equations", expression: `${d.a}(${d.x}) + ${d.b}(${d.y}) = ${d.c}`, result: d.c }];
    case "near-base-square":
      return [{ description: `Deficit from ${d.base}`, expression: `${d.base} - ${question.operands[0]}`, result: d.deficit }, { description: "Reduce by twice the deficit", expression: `${question.operands[0]} - ${d.deficit}`, result: d.reduced }, { description: "Scale by the base and add the squared deficit", expression: `${d.reduced} × ${d.base} + ${d.deficit}²`, result: question.expectedAnswer }];
    case "multiply-by-nines":
      return [{ description: "Subtract one for the left part", expression: `${d.number} - 1`, result: d.left }, { description: "Complete the right part to the multiplier", expression: `${d.multiplier} - ${d.left}`, result: d.right }, { description: "Join the fixed-width parts", expression: `${d.number} × ${d.multiplier}`, result: question.expectedAnswer }];
    case "factor-quadratic": return [{ description: "Find two constants with the required sum and product", expression: `${d.smaller} + ${d.larger} = ${d.sum}`, result: d.sum }, { description: "Form the factors", expression: `(x + ${d.smaller})(x + ${d.larger})`, result: question.expectedAnswer }];
    case "integer-multiplication": return [{ description: "Multiply vertically and crosswise", expression: `${d.a} × ${d.b}`, result: question.expectedAnswer }];
    case "sub-base-multiplication": return [{ description: "Write both numbers relative to sub-base 50", expression: `(50 ${d.offsetA >= 0 ? "+" : "-"} ${Math.abs(d.offsetA)})(50 ${d.offsetB >= 0 ? "+" : "-"} ${Math.abs(d.offsetB)})`, result: question.expectedAnswer }, { description: "Expand and combine the three terms", expression: `2500 + 50(${d.offsetA + d.offsetB}) + (${d.offsetA} × ${d.offsetB})`, result: question.expectedAnswer }];
    case "complete-square": return [{ description: "Complete the square", expression: `(x + ${d.p})² = ${d.q}²`, result: d.q * d.q }, { description: "Choose the positive root requested by the problem", expression: `x = ${d.q} - ${d.p}`, result: question.expectedAnswer }];
    case "fraction-leading-digit": return [{ description: "Perform long division until the first non-zero decimal digit", expression: `1/${d.denominator}`, result: d.firstNonZeroDigit }];
    case "symmetric-rational-equation": return [{ description: "Use the symmetry of the paired denominators", expression: `x = ${d.center}`, result: d.center }, { description: "Check both sides at the proposed center", expression: "0 = 0", result: d.center }];
    case "integer-division-remainder": return [{ description: "Use quotient-remainder identity", expression: `${d.dividend} = ${d.divisor} × ${d.quotient} + ${d.remainder}`, result: d.remainder }];
    case "linear-equation": return [{ description: "Collect the x terms and constants", expression: `x = ${d.c}`, result: d.c }];
    case "quadratic-derivative": return [{ description: "Apply the power rule term by term", expression: `f'(x) = ${2 * d.a}x + ${d.b}`, result: 2 * d.a * d.x + d.b }, { description: `Evaluate at x=${d.x}`, expression: `${2 * d.a}(${d.x}) + ${d.b}`, result: question.expectedAnswer }];
    case "coefficient-sum-product": return [{ description: "Evaluate each factor at x=1", expression: `(1 + ${d.a})(1 + ${d.b})`, result: question.expectedAnswer }];
    case "factor-coefficient-sums": return [{ description: "Evaluate divisor and quotient at x=1", expression: `(${d.divisorSum})(${d.quotientSum})`, result: question.expectedAnswer }];
    default: return [];
  }
};

const explainQuestion = (question, finalAnswer) => ({
  problem: question.prompt,
  techniqueId: question.techniqueId,
  steps: stepsFor(question),
  finalAnswer
});

module.exports = { explainQuestion, stepsFor };
