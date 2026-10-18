const { execSync } = require("child_process");
const fs = require("fs");

if (fs.existsSync("frontend")) {
  execSync("npm --prefix frontend install", { stdio: "inherit" });
} else {
  execSync("npm install", { stdio: "inherit" });
}
