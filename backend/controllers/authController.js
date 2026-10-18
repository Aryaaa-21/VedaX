const generateToken = require("../utils/generateToken");
const { toSafeUser } = require("../utils/serializeUser");
const { createAccount, authenticateCredentials, revokeTokenVersion } = require("../services/authService");

const registerUser = async (req, res) => {
  const { name, email, password } = req.validated.body;
  const user = await createAccount({ name, email, password });

  return res.status(201).json({
    token: generateToken(user._id, user.tokenVersion),
    user: toSafeUser(user)
  });
};

const authUser = async (req, res) => {
  const { email, password } = req.validated.body;
  const user = await authenticateCredentials({ email, password });

  return res.json({
    token: generateToken(user._id, user.tokenVersion),
    user: toSafeUser(user)
  });
};

const getCurrentUser = async (req, res) => res.json({ user: toSafeUser(req.user) });

const verifyAuth = async (req, res) => res.json({ valid: true, user: toSafeUser(req.user) });

const logoutUser = async (req, res) => {
  await revokeTokenVersion(req.user._id);
  return res.json({ message: "Logged out successfully" });
};

module.exports = {
  registerUser,
  authUser,
  getCurrentUser,
  verifyAuth,
  logoutUser,
  toSafeUser
};
