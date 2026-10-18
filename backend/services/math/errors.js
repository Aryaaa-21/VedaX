class MathEngineError extends Error {
  constructor(message, code = "MATH_ENGINE_ERROR") {
    super(message);
    this.name = "MathEngineError";
    this.code = code;
  }
}

module.exports = { MathEngineError };
