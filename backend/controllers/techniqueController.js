const { getTechniques, getTechniqueById } = require("../services/techniqueService");
const { AppError } = require("../utils/errors");

const list = async (req, res) => res.json(getTechniques());
const getOne = async (req, res) => {
  const technique = getTechniqueById(req.params.techniqueId);
  if (!technique) throw new AppError("Technique not found", 404, "TECHNIQUE_NOT_FOUND");
  return res.json({ technique });
};

module.exports = { list, getOne };
