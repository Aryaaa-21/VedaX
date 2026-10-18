const practiceService = require("../services/practiceService");

const startSession = async (req, res) => res.status(201).json(await practiceService.startSession({ userId: req.user._id, ...req.validated.body }));
const submitAttempt = async (req, res) => res.json(await practiceService.submitAttempt({ userId: req.user._id, sessionId: req.params.sessionId, ...req.validated.body }));
const completeSession = async (req, res) => res.json(await practiceService.completeSession({ userId: req.user._id, sessionId: req.params.sessionId, ...req.validated.body }));
const getSession = async (req, res) => res.json(await practiceService.getSession({ userId: req.user._id, sessionId: req.params.sessionId }));
const getHistory = async (req, res) => res.json({ sessions: await practiceService.getHistory({ userId: req.user._id, ...req.validated.query }) });

module.exports = { startSession, submitAttempt, completeSession, getSession, getHistory };
