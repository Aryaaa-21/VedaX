const express = require("express");
const router = express.Router();
const { protect, optionalProtect } = require("../middleware/authMiddleware");
const { asyncHandler } = require("../utils/errors");
const { validate } = require("../middleware/validate");
const { completeChallengeSchema, challengeQuerySchema } = require("../validators/challenge");
const controller = require("../controllers/dailyChallengeController");

router.get("/daily", optionalProtect, asyncHandler(controller.getDaily));
router.post("/daily/start", protect, asyncHandler(controller.start));
router.post("/daily/:sessionId/complete", protect, validate(completeChallengeSchema), asyncHandler(controller.complete));
router.get("/history", protect, validate(challengeQuerySchema, "query"), asyncHandler(controller.history));

module.exports = router;
