#!/usr/bin/env node
const { execSync } = require("child_process");
const fs = require("fs");

const run = (cmd) => {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
};

const isVercel = Boolean(process.env.VERCEL || process.env.NOW_BUILDER);
const buildTarget = process.env.BUILD_TARGET;

if (buildTarget === "frontend" || isVercel) {
  console.log("==> Building Frontend (Vercel / Static)...");
  if (!fs.existsSync("frontend/node_modules")) {
    run("npm --prefix frontend ci");
  }
  run("npm --prefix frontend run build");
} else if (buildTarget === "all") {
  console.log("==> Building All (Backend + Frontend)...");
  if (!fs.existsSync("backend/node_modules")) {
    run("npm --prefix backend ci");
  }
  if (!fs.existsSync("frontend/node_modules")) {
    run("npm --prefix frontend ci");
  }
  run("npm --prefix frontend run build");
} else {
  console.log("==> Preparing Backend (Render / Node Server)...");
  if (!fs.existsSync("backend/node_modules")) {
    run("npm --prefix backend ci");
  } else {
    run("npm --prefix backend install --no-audit");
  }
  console.log("==> Backend build ready.");
}
