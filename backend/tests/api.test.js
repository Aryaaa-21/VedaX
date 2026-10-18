process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-that-is-long-enough-for-the-api-suite";
process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/vedax-test";

const assert = require("node:assert/strict");
const test = require("node:test");
const mongoose = require("mongoose");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { app } = require("../server");
const api = request(app);

const originalMethods = {
  findOne: User.findOne,
  create: User.create,
  findById: User.findById,
  findByIdAndUpdate: User.findByIdAndUpdate,
  find: User.find,
  countDocuments: User.countDocuments
};

const makeUser = (overrides = {}) => ({
  _id: new mongoose.Types.ObjectId(),
  name: "Test Mathlete",
  email: "test@example.com",
  role: "user",
  tokenVersion: 0,
  joinedDate: new Date("2026-01-01T00:00:00.000Z"),
  level: 1,
  xp: 0,
  streak: 0,
  accuracy: 0,
  badges: [],
  completedTechniques: [],
  challengeHistory: [],
  profileImage: "",
  avatar: "https://example.com/avatar.svg",
  avgSpeed: 0,
  completedLessons: 0,
  challengeHighScore: 0,
  recentActivities: [],
  matchPassword: async (password) => password === "correct-password",
  save: async function save() { return this; },
  ...overrides
});

const queryFor = (value) => ({
  select: async () => value,
  then: (resolve, reject) => Promise.resolve(value).then(resolve, reject)
});

const tokenFor = (user) => jwt.sign(
  { id: String(user._id), tokenVersion: user.tokenVersion },
  process.env.JWT_SECRET,
  { algorithm: "HS256", expiresIn: "1h" }
);

const useReadyDatabase = (t) => {
  const previous = mongoose.connection.readyState;
  mongoose.connection.readyState = 1;
  t.after(() => { mongoose.connection.readyState = previous; });
};

const restoreModels = (t) => t.after(() => {
  Object.assign(User, originalMethods);
});

test("health and readiness expose safe service status", { concurrency: false }, async (t) => {
  useReadyDatabase(t);
  const health = await api.get("/health");
  const ready = await api.get("/ready");

  assert.equal(health.status, 200);
  assert.deepEqual(health.body.status, "healthy");
  assert.equal(health.body.database, "connected");
  assert.equal(ready.status, 200);
  assert.equal(ready.body.status, "ready");
});

test("signup validates input and never returns a password", { concurrency: false }, async (t) => {
  useReadyDatabase(t);
  restoreModels(t);
  User.findOne = async () => null;
  User.create = async (data) => makeUser(data);

  const response = await api.post("/api/auth/signup").send({
    name: "New Learner",
    email: "NEW@example.com",
    password: "correct-password"
  });

  assert.equal(response.status, 201);
  assert.ok(response.body.token);
  assert.equal(response.body.user.email, "new@example.com");
  assert.equal(response.body.user.password, undefined);
  assert.equal(response.body.user.role, "user");
});

test("duplicate signup returns a conflict and invalid signup returns field errors", { concurrency: false }, async (t) => {
  useReadyDatabase(t);
  restoreModels(t);
  User.findOne = async () => makeUser({ email: "existing@example.com" });

  const duplicate = await api.post("/api/auth/signup").send({
    name: "Existing",
    email: "existing@example.com",
    password: "correct-password"
  });
  assert.equal(duplicate.status, 409);
  assert.equal(duplicate.body.error.code, "EMAIL_EXISTS");

  const invalid = await api.post("/api/auth/signup").send({
    name: "",
    email: "not-an-email",
    password: "short"
  });
  assert.equal(invalid.status, 422);
  assert.equal(invalid.body.error.code, "VALIDATION_ERROR");
  assert.ok(invalid.body.error.fields.email);
});

test("login rejects wrong passwords and returns a safe user on success", { concurrency: false }, async (t) => {
  useReadyDatabase(t);
  restoreModels(t);
  const user = makeUser({ email: "login@example.com" });
  User.findOne = () => queryFor(user);

  const wrong = await api.post("/api/auth/login").send({
    email: user.email,
    password: "wrong-password"
  });
  assert.equal(wrong.status, 401);

  user.matchPassword = async (password) => password === "correct-password";
  const success = await api.post("/api/auth/login").send({
    email: user.email,
    password: "correct-password"
  });
  assert.equal(success.status, 200);
  assert.ok(success.body.token);
  assert.equal(success.body.user.password, undefined);
});

test("protected routes reject missing, malformed, and expired tokens", { concurrency: false }, async () => {
  const missing = await api.get("/api/auth/me");
  assert.equal(missing.status, 401);

  const malformed = await api.get("/api/auth/me").set("Authorization", "Bearer not-a-token");
  assert.equal(malformed.status, 401);

  const expired = jwt.sign({ id: new mongoose.Types.ObjectId().toString() }, process.env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: -1
  });
  const expiredResponse = await api.get("/api/auth/me").set("Authorization", `Bearer ${expired}`);
  assert.equal(expiredResponse.status, 401);
});

test("a valid token identifies only its own user", { concurrency: false }, async (t) => {
  useReadyDatabase(t);
  restoreModels(t);
  const user = makeUser({ email: "me@example.com" });
  User.findById = () => queryFor(user);

  const response = await api
    .get("/api/auth/me")
    .set("Authorization", `Bearer ${tokenFor(user)}`);

  assert.equal(response.status, 200);
  assert.equal(String(response.body.user.id), String(user._id));
  assert.equal(response.body.user.password, undefined);
});

test("profile updates allow editable fields but ignore server-controlled stats", { concurrency: false }, async (t) => {
  useReadyDatabase(t);
  restoreModels(t);
  const user = makeUser({ xp: 25, level: 1 });
  User.findById = () => queryFor(user);

  const response = await api
    .put("/api/user/profile")
    .set("Authorization", `Bearer ${tokenFor(user)}`)
    .send({ name: "Updated Learner", xp: 999999, level: 99, badges: [{ id: "admin" }] });

  assert.equal(response.status, 200);
  assert.equal(response.body.name, "Updated Learner");
  assert.equal(response.body.xp, 25);
  assert.equal(response.body.level, 1);
  assert.deepEqual(user.badges, []);
});

test("leaderboard is database-backed, deterministic, and does not rank guest payloads", { concurrency: false }, async (t) => {
  useReadyDatabase(t);
  restoreModels(t);
  const first = makeUser({ name: "First", xp: 100, level: 2 });
  const second = makeUser({ name: "Second", xp: 50, level: 1 });
  User.find = () => ({
    sort() { return this; },
    limit() { return this; },
    select: async () => [first, second]
  });
  User.findById = () => queryFor(second);
  User.countDocuments = async () => 1;

  const response = await api
    .get(`/api/leaderboard?userId=${second._id}&guestXp=999999999`);

  assert.equal(response.status, 200);
  assert.equal(response.body.top20[0].name, "First");
  assert.equal(response.body.currentUserRank.rank, 2);
  assert.equal(response.body.currentUserRank.xp, 50);

  const empty = await api.get("/api/leaderboard");
  assert.equal(empty.status, 200);
  assert.deepEqual(empty.body.top20, [
    { id: first._id.toJSON(), rank: 1, name: "First", avatar: first.avatar, xp: 100, accuracy: 0, streak: 0, isCurrentUser: false },
    { id: second._id.toJSON(), rank: 2, name: "Second", avatar: second.avatar, xp: 50, accuracy: 0, streak: 0, isCurrentUser: false }
  ]);
  assert.equal(empty.body.currentUserRank, null);
});

test("invalid leaderboard identifiers and malformed JSON are safe client errors", { concurrency: false }, async (t) => {
  useReadyDatabase(t);
  restoreModels(t);
  User.find = () => ({ sort() { return this; }, limit() { return this; }, select: async () => [] });

  const invalidId = await api.get("/api/leaderboard?userId=invalid");
  assert.equal(invalidId.status, 400);
  assert.equal(invalidId.body.error.code, "INVALID_IDENTIFIER");

  const malformed = await api
    .post("/api/auth/login")
    .set("Content-Type", "application/json")
    .send("{bad");
  assert.equal(malformed.status, 400);
  assert.equal(malformed.body.error.code, "INVALID_JSON");
});

test("logout increments token version so the current JWT can be revoked", { concurrency: false }, async (t) => {
  useReadyDatabase(t);
  restoreModels(t);
  const user = makeUser();
  User.findById = () => queryFor(user);
  let update;
  User.findByIdAndUpdate = async (id, changes) => { update = { id, changes }; return user; };

  const response = await api
    .post("/api/auth/logout")
    .set("Authorization", `Bearer ${tokenFor(user)}`);

  assert.equal(response.status, 200);
  assert.deepEqual(update.changes, { $inc: { tokenVersion: 1 } });
});
