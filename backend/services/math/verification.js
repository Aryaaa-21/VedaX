const { answersEquivalent, normalizeAnswer } = require("./normalization");

const verifyAnswer = (question, submittedAnswer) => ({
  correct: answersEquivalent(question.expectedAnswer, submittedAnswer),
  expectedAnswer: question.expectedAnswer,
  normalizedAnswer: normalizeAnswer(submittedAnswer)
});

module.exports = { verifyAnswer };
