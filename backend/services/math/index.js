const { generateQuestion } = require("./generators");
const { solveQuestion } = require("./solvers");
const { explainQuestion } = require("./explanations");
const { verifyAnswer } = require("./verification");
const { getTechnique, listTechniques, TECHNIQUES } = require("./techniques/catalog");
const { MathEngineError } = require("./errors");

const generateVerifiedQuestion = (options) => {
  const question = generateQuestion(options);
  const solved = solveQuestion(question);
  if (solved !== question.expectedAnswer) {
    throw new MathEngineError(`Cross-validation failed for ${question.techniqueId}`, "CROSS_VALIDATION_FAILED");
  }
  return {
    ...question,
    solution: explainQuestion(question, solved)
  };
};

const createQuestionSet = ({ techniqueIds, count = 5, seed = "default", difficulty = 1 }) => {
  const ids = techniqueIds && techniqueIds.length ? techniqueIds : TECHNIQUES.map((technique) => technique.id);
  if (!Number.isInteger(count) || count < 1 || count > 50) throw new MathEngineError("Question count must be between 1 and 50", "INVALID_QUESTION_COUNT");
  return Array.from({ length: count }, (_, index) => {
    const techniqueId = ids[index % ids.length];
    return generateVerifiedQuestion({ techniqueId, seed: `${seed}:${index}`, difficulty });
  });
};

module.exports = {
  TECHNIQUES,
  getTechnique,
  listTechniques,
  generateQuestion,
  generateVerifiedQuestion,
  createQuestionSet,
  solveQuestion,
  explainQuestion,
  verifyAnswer,
  MathEngineError
};
