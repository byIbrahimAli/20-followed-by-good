#!/usr/bin/env node

const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const requestedVersion = process.argv[2] || "latest";
const target = `@quranjs/api@${requestedVersion}`;

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

console.log(`Installing ${target} from npm...`);

const npmCli = resolveNpmCli();
const result = spawnSync(
  npmCli ? process.execPath : process.platform === "win32" ? "npm.cmd" : "npm",
  npmCli ? [npmCli, "install", target] : ["install", target],
  { cwd: process.cwd(), stdio: "inherit" },
);

if (result.status !== 0) {
  process.exit(result.status || 1);
}

console.log(`Installed ${target}.`);
