const { z } = require("zod");

const optionalText = (max, allowEmpty = false) => {
  const schema = z.string().trim().max(max, `Must be ${max} characters or fewer`);
  return allowEmpty ? schema.optional() : schema.min(1, "Must not be empty").optional();
};

const profileSchema = z.object({
  name: optionalText(80),
  avatar: optionalText(2048),
  profileImage: optionalText(2048, true)
});

const nonNegativeNumber = z.number().finite().min(0);

const syncSchema = z.object({
  // Editable fields are validated and may be persisted by the compatibility endpoint.
  name: optionalText(80),
  avatar: optionalText(2048),
  profileImage: optionalText(2048, true),

  // These fields are accepted for compatibility with older clients but are ignored
  // by the service. They must still be well-formed so malformed payloads fail safely.
  level: nonNegativeNumber.max(1000).optional(),
  xp: nonNegativeNumber.max(100000000).optional(),
  streak: nonNegativeNumber.max(100000).optional(),
  accuracy: nonNegativeNumber.max(100).optional(),
  avgSpeed: nonNegativeNumber.max(100000).optional(),
  completedLessons: nonNegativeNumber.max(100000).optional(),
  challengeHighScore: nonNegativeNumber.max(100000000).optional(),
  badges: z.array(z.unknown()).max(100).optional(),
  recentActivities: z.array(z.unknown()).max(100).optional(),
  completedTechniques: z.array(z.unknown()).max(1000).optional(),
  challengeHistory: z.array(z.unknown()).max(1000).optional()
});

module.exports = { profileSchema, syncSchema };
