const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { asyncHandler } = require("../utils/errors");
const { validate } = require("../middleware/validate");
const { progressQuerySchema } = require("../validators/progress");
const controller = require("../controllers/progressController");

router.use(protect);
router.get("/", asyncHandler(controller.getOverview));
router.get("/summary", asyncHandler(controller.getSummary));
router.get("/techniques", validate(progressQuerySchema, "query"), asyncHandler(controller.getTechniques));
router.get("/recommendations", asyncHandler(controller.getRecommendationsController));
router.get("/xp-history", validate(progressQuerySchema, "query"), asyncHandler(controller.getXpHistory));
router.get("/mistakes", validate(progressQuerySchema, "query"), asyncHandler(controller.getMistakes));

module.exports = router;
