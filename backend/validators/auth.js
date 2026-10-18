const { z } = require("zod");

const email = z.string()
  .trim()
  .toLowerCase()
  .max(254, "Email is too long")
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address");

const password = z.string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be 128 characters or fewer");

const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80, "Name is too long"),
  email,
  password
});

const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required").max(128, "Password is too long")
});

module.exports = { signupSchema, loginSchema };
