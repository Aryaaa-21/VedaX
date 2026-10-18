const {
  findCurrentUser,
  updateProfile,
  updateEditableFields,
  SERVER_CONTROLLED_FIELDS,
  toSafeUser
} = require("../services/userService");

const getUserProfile = async (req, res) => {
  const user = await findCurrentUser(req.user._id);
  return res.json(toSafeUser(user));
};

const updateUserProfile = async (req, res) => {
  const updatedUser = await updateProfile(req.user._id, req.validated.body);
  return res.json(toSafeUser(updatedUser));
};

const syncUserProfile = async (req, res) => {
  const user = await findCurrentUser(req.user._id);

  // Compatibility endpoint: only editable profile values are copied. Progress
  // fields remain server-controlled until verified scoring events are available.
  updateEditableFields(user, req.validated.body);
  const updatedUser = await user.save();
  return res.json(toSafeUser(updatedUser));
};

module.exports = { getUserProfile, updateUserProfile, syncUserProfile, SERVER_CONTROLLED_FIELDS };
