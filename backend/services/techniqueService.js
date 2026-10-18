const { listTechniques } = require("./math");

const getTechniques = () => ({ version: "phase2-1", techniques: listTechniques() });
const getTechniqueById = (techniqueId) => listTechniques().find((technique) => technique.id === techniqueId) || null;

module.exports = { getTechniques, getTechniqueById };
