#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const providedPath = process.argv[2];

const resolveNpmCli = () => {
  if (process.env.npm_execpath && fs.existsSync(process.env.npm_execpath)) {
    return process.env.npm_execpath;
  }

  const bundledNpmCli = path.join(
    path.dirname(process.execPath),
    "node_modules",
    "npm",
    "bin",
    "npm-cli.js",
  );

  return fs.existsSync(bundledNpmCli) ? bundledNpmCli : null;
};

if (!providedPath) {
  console.error("Usage: npm run sdk:local -- /absolute/path/to/api-js/packages/api");
  process.exit(1);
}

const resolvedPath = path.resolve(process.cwd(), providedPath);
const packageJsonPath = path.join(resolvedPath, "package.json");

if (!fs.existsSync(packageJsonPath)) {
  console.error(`No package.json found at: ${packageJsonPath}`);
  process.exit(1);
}

const localPackage = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

if (localPackage.name !== "@quranjs/api") {
  console.error(
    `Expected package name @quranjs/api, found ${localPackage.name || "unknown"}.`,
  );
  process.exit(1);
}

console.log(`Installing local SDK from ${resolvedPath}`);

const npmCli = resolveNpmCli();
const result = spawnSync(
  npmCli ? process.execPath : process.platform === "win32" ? "npm.cmd" : "npm",
  npmCli ? [npmCli, "install", resolvedPath] : ["install", resolvedPath],
  { cwd: process.cwd(), stdio: "inherit" },
);

if (result.status !== 0) {
  process.exit(result.status || 1);
}

console.log("Local SDK installed successfully.");
