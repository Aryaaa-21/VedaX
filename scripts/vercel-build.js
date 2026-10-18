const { execSync } = require("child_process");
const fs = require("fs");

if (fs.existsSync("frontend")) {
  execSync("npm --prefix frontend run build", { stdio: "inherit" });
  if (fs.existsSync("frontend/dist") && !fs.existsSync("dist")) {
    fs.cpSync("frontend/dist", "dist", { recursive: true });
  }
} else {
  execSync("npm run build", { stdio: "inherit" });
  if (fs.existsSync("dist") && !fs.existsSync("frontend/dist")) {
    fs.mkdirSync("frontend", { recursive: true });
    fs.cpSync("dist", "frontend/dist", { recursive: true });
  }
}
