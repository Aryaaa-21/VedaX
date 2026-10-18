const express = require("express");
const router = express.Router();
const {
  registerUser,
  authUser,
  getCurrentUser,
  verifyAuth,
  logoutUser
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { asyncHandler } = require("../utils/errors");
const { validate } = require("../middleware/validate");
const { authLimiter } = require("../middleware/rateLimiter");
const { signupSchema, loginSchema } = require("../validators/auth");

router.post("/signup", authLimiter, validate(signupSchema), asyncHandler(registerUser));
router.post("/login", authLimiter, validate(loginSchema), asyncHandler(authUser));
router.get("/me", protect, asyncHandler(getCurrentUser));
router.get("/verify", protect, asyncHandler(verifyAuth));
router.post("/logout", protect, asyncHandler(logoutUser));

module.exports = router;
