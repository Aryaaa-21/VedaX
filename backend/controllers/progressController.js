const progressService = require("../services/progressService");
const { getRecommendations } = require("../services/recommendationService");

const getSummary = async (req, res) => res.json(await progressService.getSummary(req.user._id));
const getOverview = async (req, res) => res.json(await progressService.getProgressOverview(req.user._id));
const getTechniques = async (req, res) => res.json({ techniques: await progressService.getTechniqueProgress(req.user._id, req.validated.query.techniqueId) });
const getRecommendationsController = async (req, res) => res.json({ recommendations: await getRecommendations(req.user._id) });
const getXpHistory = async (req, res) => res.json({ transactions: await progressService.getXpHistory(req.user._id, req.validated.query.limit) });

module.exports = { getSummary, getOverview, getTechniques, getRecommendationsController, getXpHistory };
