const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { asyncHandler } = require("../utils/errors");
const { validate } = require("../middleware/validate");
const { startSessionSchema, attemptSchema, completeSchema } = require("../validators/practice");
const controller = require("../controllers/practiceController");

router.use(protect);
router.post("/sessions", validate(startSessionSchema), asyncHandler(controller.startSession));
router.post("/sessions/:sessionId/attempts", validate(attemptSchema), asyncHandler(controller.submitAttempt));
router.post("/sessions/:sessionId/complete", validate(completeSchema), asyncHandler(controller.completeSession));
router.get("/sessions/:sessionId", asyncHandler(controller.getSession));
router.get("/history", asyncHandler(controller.getHistory));

module.exports = router;
