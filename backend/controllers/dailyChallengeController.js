const service = require("../services/dailyChallengeService");

const getDaily = async (req, res) => res.json(await service.getDaily(req.user?._id));
const start = async (req, res) => res.status(201).json(await service.startDaily(req.user._id));
const complete = async (req, res) => res.json(await service.completeDaily({ userId: req.user._id, sessionId: req.params.sessionId, ...req.validated.body }));
const history = async (req, res) => res.json({ challenges: await service.history(req.user._id, req.validated.query.limit) });

module.exports = { getDaily, start, complete, history };
