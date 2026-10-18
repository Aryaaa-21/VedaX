const express = require("express");
const router = express.Router();
const { getUserProfile, updateUserProfile, syncUserProfile } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { asyncHandler } = require("../utils/errors");
const { validate } = require("../middleware/validate");
const { profileSchema, syncSchema } = require("../validators/user");

router.get("/profile", protect, asyncHandler(getUserProfile));
router.put("/profile", protect, validate(profileSchema), asyncHandler(updateUserProfile));
router.post("/sync", protect, validate(syncSchema), asyncHandler(syncUserProfile));

module.exports = router;
