const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { asyncHandler } = require("../utils/errors");
const controller = require("../controllers/learningController");

router.use(protect);
router.get("/learner", asyncHandler(controller.learnerProfile));
router.get("/path", asyncHandler(controller.learningPath));
router.get("/difficulty/:techniqueId", asyncHandler(controller.adaptiveDifficulty));

module.exports = router;
