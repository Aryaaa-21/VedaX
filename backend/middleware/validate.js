const { AppError } = require("../utils/errors");

const validate = (schema, source = "body") => (req, res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    const fields = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join(".") || source;
      fields[key] = issue.message;
    }

    return next(new AppError("Invalid request", 422, "VALIDATION_ERROR", fields));
  }

  req.validated = req.validated || {};
  req.validated[source] = result.data;
  return next();
};

module.exports = { validate };
