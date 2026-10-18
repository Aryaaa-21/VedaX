const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../utils/errors");
const controller = require("../controllers/techniqueController");

router.get("/", asyncHandler(controller.list));
router.get("/:techniqueId", asyncHandler(controller.getOne));

module.exports = router;
